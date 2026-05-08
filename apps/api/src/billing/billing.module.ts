import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingController } from './billing.controller';
import { StripeService } from './stripe.service';
import { PlansService } from './plans.service';
import { SubscriptionsService } from './subscriptions.service';
import { BillingGuardService } from './billing-guard.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [BillingController],
  providers: [StripeService, PlansService, SubscriptionsService, BillingGuardService],
  exports: [StripeService, PlansService, SubscriptionsService, BillingGuardService],
})
export class BillingModule {}
