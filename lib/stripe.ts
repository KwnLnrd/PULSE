import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2026-01-28.clover',
    appInfo: {
        name: 'PULSE MVP',
        version: '0.1.0'
    }
});
