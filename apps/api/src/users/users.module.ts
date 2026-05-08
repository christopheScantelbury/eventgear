import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [BillingModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
