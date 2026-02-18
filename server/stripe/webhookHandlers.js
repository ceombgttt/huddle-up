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
      'UPDATE users SET stripe_subscription_id = $1, subscription_tier = $2 WHERE id = $3',
      [session.subscription, tier, userId]
    );
    console.log(`User ${userId} subscription updated to tier: ${tier}`);

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
      const tier = metadata.tier || 'fan';
      await pool.query(
        'UPDATE users SET stripe_subscription_id = $1, subscription_tier = $2 WHERE id = $3',
        [subscription.id, tier, userId]
      );
    } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      await pool.query(
        "UPDATE users SET stripe_subscription_id = NULL, subscription_tier = 'free' WHERE id = $1",
        [userId]
      );
      console.log(`User ${userId} subscription ${status}, reverted to free tier`);
    }
  }
}
