import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient.js';

export async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL required for Stripe');
  }

  console.log('Initializing Stripe schema...');
  await runMigrations({ databaseUrl });
  console.log('Stripe schema ready');

  const stripeSync = await getStripeSync();

  console.log('Setting up managed webhook...');
  const domains = process.env.REPLIT_DOMAINS || '';
  const webhookBaseUrl = `https://${domains.split(',')[0]}`;
  const { webhook } = await stripeSync.findOrCreateManagedWebhook(
    `${webhookBaseUrl}/api/stripe/webhook`
  );
  console.log(`Webhook configured: ${webhook.url}`);

  console.log('Syncing Stripe data...');
  stripeSync.syncBackfill()
    .then(() => console.log('Stripe data synced'))
    .catch((err) => console.error('Error syncing Stripe data:', err));
}
