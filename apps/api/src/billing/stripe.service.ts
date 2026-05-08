import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  public readonly client: Stripe;
  public readonly webhookSecret: string;

  constructor(private config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';

    this.client = new Stripe(secretKey, {
      apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
      typescript: true,
      appInfo: {
        name: 'EventGear',
        version: '1.0.0',
      },
    });

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set — Stripe calls will fail');
    }
  }

  /** Retorna ou cria um Stripe Customer para a empresa */
  async ensureCustomer(params: {
    companyId: string;
    email: string;
    name: string;
    existingStripeId?: string | null;
  }): Promise<string> {
    if (params.existingStripeId) {
      try {
        const c = await this.client.customers.retrieve(params.existingStripeId);
        if (c && !c.deleted) return params.existingStripeId;
      } catch {
        /* falls through to create */
      }
    }

    const created = await this.client.customers.create({
      email: params.email,
      name: params.name,
      metadata: { companyId: params.companyId },
    });
    return created.id;
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    companyId: string;
    planId: string;
  }) {
    return this.client.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        ...(params.trialDays && { trial_period_days: params.trialDays }),
        metadata: { companyId: params.companyId, planId: params.planId },
      },
      metadata: { companyId: params.companyId, planId: params.planId },
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    return this.client.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /** Verifica e parseia webhook (rawBody obrigatório) */
  constructEvent(rawBody: Buffer | string, signature: string): Stripe.Event {
    return this.client.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }
}
