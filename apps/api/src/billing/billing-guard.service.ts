import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TRIAL_DAYS = 30;

export type BillingResource = 'material' | 'event' | 'user';

@Injectable()
export class BillingGuardService {
  private readonly logger = new Logger(BillingGuardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lança ForbiddenException se a empresa atingiu o limite do plano.
   * Comportamento:
   *  - Sem plano + dentro do trial 30d → permite
   *  - Sem plano + trial expirado     → bloqueia
   *  - Com plano                      → checa limite
   */
  async ensureCanCreate(companyId: string, resource: BillingResource): Promise<void> {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { plan: true },
    });

    // Sem plano: aplica trial de 30 dias a partir do createdAt
    if (!company.plan) {
      const trialEnd = company.trialEndsAt ?? new Date(company.createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() < trialEnd) {
        // ainda em trial → libera (limites do plano Pro durante trial)
        return this.checkAgainstTrialLimits(companyId, resource);
      }
      throw new ForbiddenException({
        error: 'TRIAL_EXPIRED',
        message: 'Seu período de teste expirou. Escolha um plano para continuar.',
      });
    }

    // Com plano: checa limite específico
    const plan = company.plan;
    const usage = await this.getUsage(companyId);

    let limit: number;
    let current: number;
    let label: string;

    switch (resource) {
      case 'material':
        limit = plan.maxMaterials;
        current = usage.materials;
        label = 'materiais';
        break;
      case 'event':
        limit = plan.maxEventsPerMonth;
        current = usage.eventsThisMonth;
        label = 'eventos no mês';
        break;
      case 'user':
        limit = plan.maxUsers;
        current = usage.users;
        label = 'usuários';
        break;
    }

    if (limit !== -1 && current >= limit) {
      throw new ForbiddenException({
        error: 'PLAN_LIMIT_REACHED',
        message: `Você atingiu o limite de ${limit} ${label} do plano ${plan.name}. Faça upgrade para continuar.`,
        resource,
        limit,
        current,
      });
    }
  }

  private async checkAgainstTrialLimits(companyId: string, resource: BillingResource) {
    // Durante trial, aplicamos limites do plano Básico para evitar abuso
    const usage = await this.getUsage(companyId);
    const TRIAL_LIMITS = { material: 200, event: 20, user: 3 };
    const limit = TRIAL_LIMITS[resource];
    const current = resource === 'material' ? usage.materials
                  : resource === 'event'    ? usage.eventsThisMonth
                  : usage.users;

    if (current >= limit) {
      throw new ForbiddenException({
        error: 'TRIAL_LIMIT_REACHED',
        message: `Limite do trial atingido. Escolha um plano para criar mais.`,
        resource,
        limit,
        current,
      });
    }
  }

  async getUsage(companyId: string) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [materials, eventsThisMonth, users] = await Promise.all([
      this.prisma.material.count({ where: { companyId, deletedAt: null } }),
      this.prisma.event.count({ where: { companyId, createdAt: { gte: monthStart } } }),
      this.prisma.user.count({ where: { companyId } }),
    ]);
    return { materials, eventsThisMonth, users };
  }
}
