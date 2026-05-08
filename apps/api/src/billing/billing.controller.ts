import {
  BadRequestException,
  Body, Controller, Get, Headers, HttpCode, HttpStatus,
  Logger, Post, RawBody, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type Stripe from 'stripe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { PlansService } from './plans.service';
import { SubscriptionsService } from './subscriptions.service';
import { BillingGuardService } from './billing-guard.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private plans: PlansService,
    private subscriptions: SubscriptionsService,
    private guard: BillingGuardService,
    private config: ConfigService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Lista os planos públicos disponíveis' })
  listPlans() {
    return this.plans.listPublic();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Status de billing da empresa: plano, assinatura, uso' })
  status(@CurrentUser() u: AuthUser) {
    return this.subscriptions.getCompanyBillingStatus(u.companyId);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uso atual da empresa (materiais, eventos do mês, usuários)' })
  usage(@CurrentUser() u: AuthUser) {
    return this.guard.getUsage(u.companyId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria sessão de Stripe Checkout para assinar um plano' })
  async checkout(@CurrentUser() u: AuthUser, @Body() dto: CheckoutDto) {
    const plan = await this.plans.getBySlug(dto.planSlug);
    if (!plan.stripePriceId) {
      throw new BadRequestException(`Plano ${plan.slug} sem stripePriceId configurado`);
    }

    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: u.companyId },
    });
    const me = await this.prisma.user.findUniqueOrThrow({ where: { id: u.id } });

    const customerId = await this.stripe.ensureCustomer({
      companyId: company.id,
      email: company.email,
      name: company.name,
      existingStripeId: company.stripeCustomerId,
    });

    if (!company.stripeCustomerId) {
      await this.prisma.company.update({
        where: { id: company.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const webUrl = this.config.get<string>('WEB_URL') ?? 'https://eventgear-web.h1dq2d.easypanel.host';

    const session = await this.stripe.createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      successUrl: `${webUrl}/configuracoes?checkout=success`,
      cancelUrl: `${webUrl}/planos?checkout=cancel`,
      trialDays: 30,
      companyId: company.id,
      planId: plan.id,
    });

    return { url: session.url, sessionId: session.id };
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria URL do Customer Portal Stripe (gerenciar pagamento, cancelar)' })
  async portal(@CurrentUser() u: AuthUser) {
    const company = await this.prisma.company.findUniqueOrThrow({ where: { id: u.companyId } });
    if (!company.stripeCustomerId) {
      throw new BadRequestException('Empresa ainda não tem cadastro no Stripe');
    }
    const webUrl = this.config.get<string>('WEB_URL') ?? 'https://eventgear-web.h1dq2d.easypanel.host';
    const portal = await this.stripe.createPortalSession(company.stripeCustomerId, `${webUrl}/configuracoes`);
    return { url: portal.url };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recebe webhooks do Stripe (assinatura HMAC)' })
  async webhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() rawBody: Buffer,
    @Req() req: { rawBody?: Buffer; body?: unknown },
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');

    // Fastify pode entregar rawBody diferente — fallback
    const body = rawBody ?? req.rawBody ?? (typeof req.body === 'string' ? Buffer.from(req.body) : Buffer.from(JSON.stringify(req.body)));

    let event: Stripe.Event;
    try {
      event = this.stripe.constructEvent(body, signature);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Dedup
    const existing = await this.prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) {
      this.logger.log(`Stripe event ${event.id} already processed, skipping`);
      return { received: true };
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.subscription && typeof session.subscription === 'string') {
            const sub = await this.stripe.client.subscriptions.retrieve(session.subscription);
            await this.subscriptions.syncFromStripe(sub);
          }
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.trial_will_end': {
          const sub = event.data.object as Stripe.Subscription;
          await this.subscriptions.syncFromStripe(sub);
          break;
        }
        case 'invoice.paid':
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription && typeof invoice.subscription === 'string') {
            const sub = await this.stripe.client.subscriptions.retrieve(invoice.subscription);
            await this.subscriptions.syncFromStripe(sub);
          }
          break;
        }
        default:
          this.logger.debug(`Ignored Stripe event type: ${event.type}`);
      }

      await this.prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
    } catch (err) {
      this.logger.error(`Error processing Stripe event ${event.id}: ${(err as Error).message}`);
      throw err;
    }

    return { received: true };
  }
}
