import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { MaterialsModule } from './materials/materials.module';
import { EventsModule } from './events/events.module';
import { ChecklistModule } from './checklist/checklist.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    StorageModule,
    MailModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    CalendarModule,
    MaterialsModule,
    EventsModule,
    ChecklistModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
