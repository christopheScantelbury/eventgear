import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = config.get('SMTP_FROM') ?? 'no-reply@eventgear.com.br';
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: parseInt(config.get('SMTP_PORT') ?? '587'),
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendWelcome(to: string, name: string, companyName: string): Promise<void> {
    await this.send(to, `Bem-vindo ao EventGear, ${name}!`, this.welcomeHtml(name, companyName));
  }

  async sendEventSummary(
    to: string,
    eventName: string,
    summary: { confirmed: number; pending: number; missing: number; damaged: number },
  ): Promise<void> {
    await this.send(
      to,
      `Relatório de checklist — ${eventName}`,
      this.summaryHtml(eventName, summary),
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  private welcomeHtml(name: string, companyName: string): string {
    return `
      <h2>Bem-vindo ao EventGear!</h2>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Sua empresa <strong>${companyName}</strong> foi cadastrada com sucesso.</p>
      <p>Agora você pode cadastrar materiais, criar eventos e controlar o inventário via QR Code.</p>
      <hr/>
      <small>EventGear — ScantelburyDevs</small>
    `;
  }

  private summaryHtml(
    eventName: string,
    s: { confirmed: number; pending: number; missing: number; damaged: number },
  ): string {
    return `
      <h2>Relatório de Checklist</h2>
      <p>Evento: <strong>${eventName}</strong></p>
      <table cellpadding="8" style="border-collapse:collapse">
        <tr><td>✅ Confirmados</td><td><strong>${s.confirmed}</strong></td></tr>
        <tr><td>⏳ Pendentes</td><td><strong>${s.pending}</strong></td></tr>
        <tr><td>❌ Faltando</td><td><strong>${s.missing}</strong></td></tr>
        <tr><td>⚠️ Danificados</td><td><strong>${s.damaged}</strong></td></tr>
      </table>
      <hr/>
      <small>EventGear — ScantelburyDevs</small>
    `;
  }
}
