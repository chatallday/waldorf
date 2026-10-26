import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planType, email } = req.body;

    if (!planType || (planType !== 'user-premium' && planType !== 'mentor-pro')) {
      return res.status(400).json({ error: 'Invalid plan type. Must be "user-premium" or "mentor-pro"' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const priceIds: Record<string, string> = {
      'user-premium': process.env.STRIPE_USER_PREMIUM_PRICE_ID || '',
      'mentor-pro': process.env.STRIPE_MENTOR_PRO_PRICE_ID || '',
    };

    const priceId = priceIds[planType];

    if (!priceId) {
      return res.status(500).json({ error: `Price ID not configured for plan type: ${planType}` });
    }

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        email,
        planType
      },
      after_completion: {
        type: 'redirect',
        redirect: { url: `${process.env.APP_URL || 'https://thewaldorfpath.com'}/success?session_id={CHECKOUT_SESSION_ID}` },
      },
    });

    return res.status(200).json({ url: paymentLink.url, id: paymentLink.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
}
