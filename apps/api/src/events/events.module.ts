import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [BillingModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
