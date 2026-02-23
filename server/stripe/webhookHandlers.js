import { getStripeSync } from './stripeClient.js';
import pool from '../db.js';

export class WebhookHandlers {
  static async processWebhook(payload, signature) {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    try {
      const event = JSON.parse(payload.toString());
      await WebhookHandlers.handleCustomEvent(event);
    } catch (err) {
      console.error('Custom webhook handler error:', err.message);
    }
  }

  static async handleCustomEvent(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await WebhookHandlers.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await WebhookHandlers.onSubscriptionChanged(event.data.object);
        break;
    }
  }

  static async onCheckoutCompleted(session) {
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const tier = metadata.tier;
    const referredBy = metadata.referredBy;

    if (!userId || !tier) return;

    await pool.query(
      'UPDATE users SET stripe_subscription_id = $1, subscription_tier = $2, subscription_status = $3 WHERE id = $4',
      [session.subscription, tier, 'active', userId]
    );
    console.log(`User ${userId} subscription updated to tier: ${tier}`);

    if (tier === 'featured_venue') {
      try {
        const venueResult = await pool.query('SELECT id FROM venues WHERE claimed_by = $1', [userId]);
        if (venueResult.rows.length > 0) {
          await pool.query(
            `UPDATE venues SET featured = true, featured_tier = 'featured', featured_subscription_id = $1, featured_until = NOW() + INTERVAL '30 days' WHERE claimed_by = $2`,
            [session.subscription, userId]
          );
          console.log(`Venue for user ${userId} upgraded to Featured`);
        }
      } catch (err) {
        console.error('Featured venue upgrade error:', err.message);
      }
    }

    if (tier === 'sponsor') {
      try {
        const existing = await pool.query('SELECT id FROM sponsors WHERE user_id = $1', [userId]);
        if (existing.rows.length === 0) {
          const userInfo = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
          const u = userInfo.rows[0];
          await pool.query(
            `INSERT INTO sponsors (name, contact_name, contact_email, user_id, tagline, status, amount_paid, payment_frequency, start_date)
             VALUES ($1, $2, $3, $4, $5, 'active', 99.99, 'monthly', NOW())`,
            [u?.name || 'New Sponsor', u?.name || '', u?.email || '', userId, 'Your tagline here']
          );
          console.log(`Auto-created sponsor record for user ${userId}`);
        } else {
          await pool.query("UPDATE sponsors SET status = 'active' WHERE user_id = $1", [userId]);
        }
      } catch (err) {
        console.error('Auto-create sponsor error:', err.message);
      }
    }

    if (referredBy) {
      try {
        const referrerResult = await pool.query(
          'SELECT id FROM users WHERE referral_code = $1',
          [referredBy]
        );
        if (referrerResult.rows.length > 0) {
          const referrerId = referrerResult.rows[0].id;
          const amountPaid = session.amount_total || 0;
          const commission = Math.round(amountPaid * 0.10);

          await pool.query(
            `INSERT INTO referral_conversions (referrer_id, referred_user_id, subscription_tier, commission_amount, status)
             VALUES ($1, $2, $3, $4, 'pending')
             ON CONFLICT DO NOTHING`,
            [referrerId, userId, tier, commission]
          );
          console.log(`Referral conversion: user ${userId} referred by ${referrerId}, commission: $${(commission / 100).toFixed(2)}`);
        }
      } catch (err) {
        console.error('Referral conversion error:', err.message);
      }
    }
  }

  static async onSubscriptionChanged(subscription) {
    const customerId = subscription.customer;
    const status = subscription.status;

    const userResult = await pool.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    if (userResult.rows.length === 0) return;

    const userId = userResult.rows[0].id;

    if (status === 'active') {
      const metadata = subscription.metadata || {};
      const existingTier = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
      const tier = metadata.tier || existingTier.rows[0]?.subscription_tier || 'free';
      await pool.query(
        'UPDATE users SET stripe_subscription_id = $1, subscription_tier = $2, subscription_status = $3 WHERE id = $4',
        [subscription.id, tier, 'active', userId]
      );
    } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      const prevTier = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
      await pool.query(
        "UPDATE users SET stripe_subscription_id = NULL, subscription_tier = 'free' WHERE id = $1",
        [userId]
      );
      if (prevTier.rows[0]?.subscription_tier === 'sponsor') {
        await pool.query("UPDATE sponsors SET status = 'ended' WHERE user_id = $1", [userId]);
      }
      if (prevTier.rows[0]?.subscription_tier === 'featured_venue') {
        await pool.query("UPDATE venues SET featured = false, featured_tier = 'standard', featured_subscription_id = NULL, featured_until = NULL WHERE claimed_by = $1", [userId]);
        console.log(`Venue for user ${userId} featured status removed`);
      }
      console.log(`User ${userId} subscription ${status}, reverted to free tier`);
    }
  }
}
