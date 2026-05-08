import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function buildDatasourceUrl(): string {
  const url = process.env.DATABASE_URL ?? '';
  // Ensure sslmode=disable for internal Docker/private network connections
  // (PostgreSQL 17 may require explicit SSL negotiation otherwise)
  if (!url.includes('sslmode=')) {
    return url + (url.includes('?') ? '&' : '?') + 'sslmode=disable';
  }
  return url;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ datasources: { db: { url: buildDatasourceUrl() } } });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (err) {
      this.logger.error('Database connection failed on init', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
