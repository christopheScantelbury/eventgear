import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    let db = 'ok';
    let dbError: string | undefined;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err: unknown) {
      db = 'error';
      dbError = err instanceof Error ? err.message.substring(0, 200) : String(err);
    }

    const status = db === 'ok' ? 'ok' : 'degraded';
    return { status, db, dbError, timestamp: new Date().toISOString() };
  }
}
