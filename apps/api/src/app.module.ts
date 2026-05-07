import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // Módulos de domínio — adicionados nas semanas de implementação:
    // AuthModule, MaterialsModule, EventsModule, ChecklistModule,
    // ReportsModule, StorageModule, MailModule
  ],
})
export class AppModule {}
