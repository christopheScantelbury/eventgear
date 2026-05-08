import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

const STRIPE_TO_INTERNAL: Record<string, SubscriptionStatus> = {
  trialing:           'TRIALING',
  active:             'ACTIVE',
  past_due:           'PAST_DUE',
  canceled:           'CANCELED',
  incomplete:         'INCOMPLETE',
  incomplete_expired: 'INCOMPLETE_EXPIRED',
  unpaid:             'UNPAID',
  paused:             'PAUSED',
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /** Status atual da empresa (assinatura ativa + plano + uso) */
  async getCompanyBillingStatus(companyId: string) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { plan: true },
    });

    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId, status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] } },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    // Uso do mês atual
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [materialsCount, eventsThisMonth, usersCount] = await Promise.all([
      this.prisma.material.count({ where: { companyId, deletedAt: null } }),
      this.prisma.event.count({ where: { companyId, createdAt: { gte: monthStart } } }),
      this.prisma.user.count({ where: { companyId } }),
    ]);

    return {
      company: {
        id: company.id,
        name: company.name,
        trialEndsAt: company.trialEndsAt,
      },
      plan: company.plan ?? subscription?.plan ?? null,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            cancelAt: subscription.cancelAt,
          }
        : null,
      usage: {
        materials: materialsCount,
        eventsThisMonth,
        users: usersCount,
      },
    };
  }

  /** Sincroniza assinatura local com o estado do Stripe */
  async syncFromStripe(stripeSub: Stripe.Subscription) {
    const companyId = (stripeSub.metadata?.companyId as string) ?? null;
    const planId    = (stripeSub.metadata?.planId    as string) ?? null;

    if (!companyId) {
      this.logger.warn(`Stripe subscription ${stripeSub.id} sem companyId no metadata`);
      return;
    }

    const status = STRIPE_TO_INTERNAL[stripeSub.status] ?? 'INCOMPLETE';

    const data: Prisma.SubscriptionUncheckedCreateInput = {
      companyId,
      planId: planId!,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id,
      status,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd:   new Date(stripeSub.current_period_end   * 1000),
      trialEndsAt:        stripeSub.trial_end   ? new Date(stripeSub.trial_end   * 1000) : null,
      cancelAt:           stripeSub.cancel_at   ? new Date(stripeSub.cancel_at   * 1000) : null,
      canceledAt:         stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
    };

    const existing = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: { ...data },
      });
    } else {
      await this.prisma.subscription.create({ data });
    }

    // Atualiza o plano da empresa quando ativo / trialing
    if ((status === 'ACTIVE' || status === 'TRIALING') && planId) {
      await this.prisma.company.update({
        where: { id: companyId },
        data: { planId, trialEndsAt: data.trialEndsAt },
      });
    } else if (status === 'CANCELED' || status === 'UNPAID') {
      await this.prisma.company.update({
        where: { id: companyId },
        data: { planId: null },
      });
    }
  }

  /** Cancela no fim do período */
  async findActiveByCompany(companyId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { companyId, status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) throw new NotFoundException('No active subscription');
    return sub;
  }
}
