import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripe/stripeClient.js';

const router = Router();

const INFLUENCER_COUPON_ID = 'HUDDLE_INFLUENCER_50';
async function getOrCreateInfluencerCoupon() {
  const stripe = await getUncachableStripeClient();
  try {
    await stripe.coupons.retrieve(INFLUENCER_COUPON_ID);
    return INFLUENCER_COUPON_ID;
  } catch (e) {
    if (e.statusCode === 404) {
      await stripe.coupons.create({
        id: INFLUENCER_COUPON_ID,
        percent_off: 50,
        duration: 'forever',
        name: 'Influencer 50% Off Pro',
      });
      return INFLUENCER_COUPON_ID;
    }
    throw e;
  }
}

router.get('/publishable-key', async (req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (error) {
    console.error('Get publishable key error:', error);
    res.status(500).json({ error: 'Could not get Stripe key' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.name, pr.unit_amount
    `);

    const productsMap = new Map();
    for (const row of result.rows) {
      if (!productsMap.has(row.product_id)) {
        const metadata = typeof row.product_metadata === 'string'
          ? JSON.parse(row.product_metadata)
          : row.product_metadata || {};
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata,
          prices: []
        });
      }
      if (row.price_id) {
        const recurring = typeof row.recurring === 'string'
          ? JSON.parse(row.recurring)
          : row.recurring;
        productsMap.get(row.product_id).prices.push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          recurring,
        });
      }
    }

    res.json(Array.from(productsMap.values()));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { priceId, affiliateCode } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const priceResult = await pool.query(`
      SELECT pr.id, pr.product, pr.active, p.metadata as product_metadata, p.active as product_active
      FROM stripe.prices pr
      JOIN stripe.products p ON p.id = pr.product
      WHERE pr.id = $1
    `, [priceId]);

    if (priceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const priceRow = priceResult.rows[0];
    if (!priceRow.active || !priceRow.product_active) {
      return res.status(400).json({ error: 'Price or product is no longer active' });
    }

    const productMetadata = typeof priceRow.product_metadata === 'string'
      ? JSON.parse(priceRow.product_metadata)
      : priceRow.product_metadata || {};
    const tier = productMetadata.tier || 'fan';

    const stripe = await getUncachableStripeClient();
    const userId = req.session.userId;

    const userResult = await pool.query(
      'SELECT id, email, name, stripe_customer_id, referral_code, referred_by, affiliate_code FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    let validAffiliateCode = null;
    if (affiliateCode && affiliateCode.trim() && tier === 'pro') {
      if (user.affiliate_code) {
        return res.status(400).json({ error: 'You have already used an influencer code' });
      }
      const affCheck = await pool.query(
        'SELECT id, code, status, max_redemptions, expiration_date FROM affiliates WHERE code = $1',
        [affiliateCode.trim().toUpperCase()]
      );
      if (affCheck.rows.length > 0) {
        const aff = affCheck.rows[0];
        if (aff.status === 'active' && (!aff.expiration_date || new Date(aff.expiration_date) > new Date())) {
          if (aff.max_redemptions) {
            const usage = await pool.query('SELECT COUNT(*) as count FROM affiliate_referrals WHERE affiliate_id = $1', [aff.id]);
            if (parseInt(usage.rows[0].count) < aff.max_redemptions) {
              validAffiliateCode = aff;
            }
          } else {
            validAffiliateCode = aff;
          }
        }
      }
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const isVenueTier = ['venue', 'featured_venue'].includes(tier);

    let hadPreviousVenueSub = false;
    if (isVenueTier && user.stripe_customer_id) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 100,
          status: 'all',
        });
        hadPreviousVenueSub = subs.data.some(s =>
          ['venue', 'featured_venue'].includes(s.metadata?.tier)
        );
      } catch (e) {
        console.error('Error checking previous subs:', e.message);
      }
    }

    const shouldApplyTrial = isVenueTier && !hadPreviousVenueSub;

    const sessionParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
      metadata: {
        userId: user.id,
        tier,
        referredBy: user.referred_by || '',
        affiliateCode: validAffiliateCode ? validAffiliateCode.code : '',
      },
    };

    sessionParams.subscription_data = {
      metadata: {
        userId: user.id,
        tier,
      },
    };

    if (shouldApplyTrial) {
      sessionParams.subscription_data.trial_period_days = 90;
    }

    if (validAffiliateCode) {
      sessionParams.discounts = [{
        coupon: await getOrCreateInfluencerCoupon(),
      }];
      sessionParams.subscription_data.metadata.affiliateCode = validAffiliateCode.code;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await pool.query(
      'SELECT stripe_subscription_id, subscription_tier, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );
    const user = result.rows[0];
    if (!user || !user.stripe_subscription_id) {
      return res.json({ subscription: null, tier: user?.subscription_tier || 'free' });
    }

    const subResult = await pool.query(
      'SELECT * FROM stripe.subscriptions WHERE id = $1',
      [user.stripe_subscription_id]
    );

    res.json({
      subscription: subResult.rows[0] || null,
      tier: user.subscription_tier,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Could not fetch subscription' });
  }
});

router.post('/portal', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );
    const user = result.rows[0];
    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const stripe = await getUncachableStripeClient();
    const host = req.get('host');
    const protocol = req.protocol;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${protocol}://${host}/`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Could not open billing portal' });
  }
});

router.post('/sync-subscription', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userResult = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user?.stripe_customer_id) {
      return res.json({ tier: 'free' });
    }

    const subResult = await pool.query(
      `SELECT s.id, s.status, s.metadata
       FROM stripe.subscriptions s
       WHERE s.customer = $1 AND s.status = 'active'
       ORDER BY s.created DESC LIMIT 1`,
      [user.stripe_customer_id]
    );

    if (subResult.rows.length > 0) {
      const sub = subResult.rows[0];
      const metadata = typeof sub.metadata === 'string' ? JSON.parse(sub.metadata) : sub.metadata || {};
      const tier = metadata.tier || 'fan';
      await pool.query(
        'UPDATE users SET stripe_subscription_id = $1, subscription_tier = $2, subscription_status = $3 WHERE id = $4',
        [sub.id, tier, 'active', userId]
      );
      return res.json({ tier, subscriptionId: sub.id, status: 'active' });
    }

    await pool.query(
      "UPDATE users SET stripe_subscription_id = NULL, subscription_tier = 'free', subscription_status = CASE WHEN trial_ends_at > NOW() THEN 'trial' ELSE 'expired' END WHERE id = $1",
      [userId]
    );
    res.json({ tier: 'free' });
  } catch (error) {
    console.error('Sync subscription error:', error);
    res.status(500).json({ error: 'Could not sync subscription' });
  }
});

export default router;
