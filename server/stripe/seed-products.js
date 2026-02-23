import { getUncachableStripeClient } from './stripeClient.js';

const PRODUCTS = [
  {
    name: 'Huddle Up Pro',
    description: 'Ad-free experience, VIP badge, 2x points multiplier, early party access, custom profile themes, and more premium perks.',
    metadata: { tier: 'pro', order: '1' },
    priceAmountCents: 299,
    yearlyPriceAmountCents: 2999,
  },
  {
    name: 'Huddle Up Venue',
    description: 'Claim and manage your venue, appear in search results, upload photos, and connect with fans in your area.',
    metadata: { tier: 'venue', order: '2' },
    priceAmountCents: 2999,
  },
  {
    name: 'Huddle Up Featured Venue',
    description: 'Priority placement in search results, Featured badge, trending feed boost, and enhanced analytics for your venue.',
    metadata: { tier: 'featured_venue', order: '3' },
    priceAmountCents: 4999,
  },
  {
    name: 'Huddle Up Sponsor',
    description: 'Premium banner ad placement across all sports, featured placement, and analytics on your sponsorship reach.',
    metadata: { tier: 'sponsor', order: '4' },
    priceAmountCents: 9999,
  },
];

async function seedProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log('Connected to Stripe, creating products...');

    for (const p of PRODUCTS) {
      const existing = await stripe.products.search({ query: `name:'${p.name}'` });
      if (existing.data.length > 0) {
        console.log(`Product "${p.name}" already exists (${existing.data[0].id}), skipping`);
        continue;
      }

      const product = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: p.metadata,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.priceAmountCents,
        currency: 'usd',
        recurring: { interval: 'month' },
      });

      console.log(`Created: ${p.name} (${product.id}) - $${(p.priceAmountCents / 100).toFixed(2)}/mo (${price.id})`);

      if (p.yearlyPriceAmountCents) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: p.yearlyPriceAmountCents,
          currency: 'usd',
          recurring: { interval: 'year' },
        });
        console.log(`  + Yearly price: $${(p.yearlyPriceAmountCents / 100).toFixed(2)}/yr (${yearlyPrice.id})`);
      }
    }

    console.log('Done! Products will sync to database via webhook.');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedProducts();
