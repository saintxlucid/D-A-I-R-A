import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

@Injectable()
export class MarketplaceService {
  async createCheckoutSession(productId: string, buyerId: string, price: number) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: productId }, unit_amount: price * 100 }, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://daira.app/success',
      cancel_url: 'https://daira.app/cancel',
      metadata: { productId, buyerId },
    });
    return { url: session.url };
  }
  async handleWebhook(event: Stripe.Event) {
    // Placeholder: handle payment events
    return { received: true };
  }
  getPublisherFee(amount: number) {
    const takeRate = 0.1; // 10% platform fee
    return amount * takeRate;
  }
}import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

@Injectable()
export class MarketplaceService {
  async createCheckoutSession(productId: string, buyerId: string, price: number) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: productId }, unit_amount: price * 100 }, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://daira.app/success',
      cancel_url: 'https://daira.app/cancel',
      metadata: { productId, buyerId },
    });
    return { url: session.url };
  }
  async handleWebhook(event: Stripe.Event) {
    // Placeholder: handle payment events
    return { received: true };
  }
  getPublisherFee(amount: number) {
    const takeRate = 0.1; // 10% platform fee
    return amount * takeRate;
  }
}
