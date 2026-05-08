import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async listPublic() {
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        maxMaterials: true,
        maxEventsPerMonth: true,
        maxUsers: true,
        maxBranches: true,
        hasReports: true,
        hasPdfExport: true,
        hasMultiBranch: true,
        priceMonthlyBrl: true,
      },
    });
  }

  async getBySlug(slug: string) {
    const plan = await this.prisma.plan.findUnique({ where: { slug } });
    if (!plan) throw new NotFoundException(`Plan ${slug} not found`);
    return plan;
  }

  async getById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }
}
