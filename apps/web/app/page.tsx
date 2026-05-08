import Link from 'next/link';
import { BrandLockup } from '@/components/brand/logo';
import {
  Package,
  CalendarDays,
  QrCode,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Boxes,
  ClipboardCheck,
  ScanLine,
  Star,
  Zap,
  Users,
} from 'lucide-react';

/* ─── Planos ─────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Ideal para testar e projetos pequenos.',
    highlight: false,
    cta: 'Criar conta grátis',
    href: '/register',
    features: [
      '1 operador',
      'Até 100 equipamentos',
      'Até 10 eventos / mês',
      'Checklist com QR Code',
      'Relatórios básicos',
    ],
    missing: ['Exportação PDF', 'Suporte prioritário', 'Múltiplos operadores'],
  },
  {
    name: 'Pro',
    price: 'R$ 79',
    period: '/ mês',
    description: 'Para equipes que trabalham com eventos regularmente.',
    highlight: true,
    cta: 'Começar 14 dias grátis',
    href: '/register?plan=pro',
    features: [
      '3 operadores',
      'Equipamentos ilimitados',
      'Eventos ilimitados',
      'Checklist com QR Code',
      'Relatórios completos + PDF',
      'Suporte prioritário por e-mail',
    ],
    missing: ['Múltiplos operadores ilimitados'],
  },
  {
    name: 'Equipe',
    price: 'R$ 199',
    period: '/ mês',
    description: 'Para empresas com múltiplas equipes e alto volume.',
    highlight: false,
    cta: 'Falar com vendas',
    href: 'mailto:contato@eventgear.com.br',
    features: [
      'Operadores ilimitados',
      'Equipamentos ilimitados',
      'Eventos ilimitados',
      'Checklist com QR Code',
      'Relatórios completos + PDF',
      'API de integração',
      'Suporte dedicado',
    ],
    missing: [],
  },
];

/* ─── Features ───────────────────────────────────────────────── */
const features = [
  {
    icon: Package,
    title: 'Catálogo de Equipamentos',
    body: 'Cadastre microfones, câmeras, cabos, palcos e qualquer item. Organize por categoria, adicione fotos e controle o estado de cada peça.',
  },
  {
    icon: CalendarDays,
    title: 'Gestão de Eventos',
    body: 'Crie eventos, associe os equipamentos necessários e acompanhe tudo em um só lugar. Nunca mais esqueça um item em casa.',
  },
  {
    icon: QrCode,
    title: 'Checklist por QR Code',
    body: 'Cada equipamento tem seu QR Code único. Na saída e no retorno, basta escanear para confirmar — rápido, sem papel.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Histórico',
    body: 'Veja quais equipamentos saem mais, eventos com itens pendentes e exporte relatórios PDF para clientes ou seguros.',
  },
];

/* ─── Steps ──────────────────────────────────────────────────── */
const steps = [
  {
    icon: Boxes,
    step: '01',
    title: 'Cadastre seus equipamentos',
    body: 'Adicione nome, categoria, número de série e foto. Gere o QR Code com um clique.',
  },
  {
    icon: ClipboardCheck,
    step: '02',
    title: 'Monte o evento',
    body: 'Crie o evento, selecione os equipamentos e defina a equipe responsável.',
  },
  {
    icon: ScanLine,
    step: '03',
    title: 'Escaneia, vai e volta',
    body: 'Use o scanner no celular. Na saída e no retorno do evento, tudo registrado em segundos.',
  },
];

/* ─── Testimonials ───────────────────────────────────────────── */
const testimonials = [
  {
    quote: 'Antes a gente perdia equipamento em todo evento. Com o EventGear zeramos as perdas.',
    name: 'Rafael M.',
    role: 'Produtor de Eventos, SP',
  },
  {
    quote: 'O checklist por QR Code virou rotina da equipe. Simples e rápido.',
    name: 'Camila T.',
    role: 'Técnica de Som, RJ',
  },
  {
    quote: 'Consegui provar para o cliente exatamente o que foi entregue e devolvido. Isso vale ouro.',
    name: 'Bruno S.',
    role: 'Locadora de Equipamentos, BH',
  },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-text-primary">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-dark-border bg-dark-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLockup size="md" />
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block px-4 py-2 text-sm font-semi font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-sm font-semi font-semibold text-dark-900 hover:bg-amber-400 transition-colors"
            >
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* amber glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-amber-500/8 blur-[120px]"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-medium text-amber-400 uppercase tracking-widest">
            <Zap className="h-3 w-3" />
            Novo · Checklist por QR Code
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-tight tracking-tight text-text-primary">
            Controle total dos seus{' '}
            <span className="text-amber-500">equipamentos</span>{' '}
            de evento
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-lg text-text-secondary leading-relaxed">
            Cadastre, organize e rastreie equipamentos de eventos com checklist por QR Code.
            Saiba o que saiu, o que voltou e o que ficou — tudo no celular.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-base font-semi font-semibold text-dark-900 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-dark-border-med bg-dark-800 px-6 py-3 text-base font-semi font-semibold text-text-primary hover:bg-dark-700 transition-all"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Grátis para sempre no plano básico · Sem cartão de crédito
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-dark-border bg-dark-800 shadow-2xl overflow-hidden">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-dark-border bg-dark-900 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 rounded bg-dark-700 px-3 py-1 text-xs text-text-muted font-mono">
                eventgear.app/dashboard
              </div>
            </div>
            {/* mock dashboard content */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Equipamentos', value: '247', color: 'text-amber-400' },
                  { label: 'Eventos ativos', value: '8', color: 'text-green-400' },
                  { label: 'Itens fora', value: '34', color: 'text-blue-400' },
                  { label: 'Pendentes', value: '2', color: 'text-red-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-dark-border bg-dark-900 p-4">
                    <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-2xl font-display font-extrabold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-dark-border bg-dark-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
                  <span className="text-sm font-semi font-semibold">Últimos movimentos</span>
                  <span className="text-xs text-text-muted font-mono">hoje</span>
                </div>
                <div className="divide-y divide-dark-border">
                  {[
                    { name: 'Caixa de Som JBL 15"', event: 'Festival Norte', status: 'Fora', color: 'text-amber-400' },
                    { name: 'Microfone Shure SM58', event: 'Show Aniversário', status: 'Devolvido', color: 'text-green-400' },
                    { name: 'Mesa de Som Yamaha', event: 'Corporativo 12/05', status: 'Fora', color: 'text-amber-400' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.event}</p>
                      </div>
                      <span className={`text-xs font-mono font-semibold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* bottom glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 h-32 w-3/4 bg-amber-500/5 blur-2xl rounded-full"
          />
        </div>
      </section>

      {/* ── Social proof numbers ────────────────────────────────── */}
      <section className="border-y border-dark-border bg-dark-800/50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <dl className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '5.000+', label: 'Equipamentos controlados' },
              { value: '1.200+', label: 'Eventos realizados' },
              { value: 'Zero', label: 'Papel usado' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="font-display font-extrabold text-3xl sm:text-4xl text-amber-500">{s.value}</dt>
                <dd className="mt-1 text-xs sm:text-sm text-text-secondary">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
              Tudo que você precisa para{' '}
              <span className="text-amber-500">não perder mais nada</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Do cadastro ao checklist final, o EventGear cobre cada etapa do ciclo de um equipamento.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-dark-border bg-dark-800 p-6 hover:border-amber-500/40 hover:bg-dark-800/80 transition-all"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/12 text-amber-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semi font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-dark-800/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
              Como funciona
            </h2>
            <p className="mt-4 text-text-secondary">Em três passos do primeiro equipamento ao primeiro evento.</p>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-8">
            {/* connector line desktop */}
            <div
              aria-hidden
              className="hidden sm:block absolute top-10 left-[calc(16.6%+1.5rem)] right-[calc(16.6%+1.5rem)] h-px bg-gradient-to-r from-amber-500/30 via-amber-500/60 to-amber-500/30"
            />
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="relative text-center">
                <div className="relative mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
                  <Icon className="h-8 w-8 text-amber-400" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-mono font-bold text-dark-900">
                    {step}
                  </span>
                </div>
                <h3 className="font-semi font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
              Quem já usa, <span className="text-amber-500">não volta atrás</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-dark-border bg-dark-800 p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semi font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="precos" className="py-20 sm:py-28 bg-dark-800/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
              Planos e preços
            </h2>
            <p className="mt-4 text-text-secondary">
              Comece grátis. Escale quando precisar. Cancele a qualquer hora.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'rounded-2xl border p-7 flex flex-col gap-5 transition-all',
                  plan.highlight
                    ? 'border-amber-500/60 bg-dark-800 shadow-xl shadow-amber-500/10 relative'
                    : 'border-dark-border bg-dark-800',
                ].join(' ')}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-mono font-bold text-dark-900 uppercase tracking-wider whitespace-nowrap">
                    Mais popular
                  </span>
                )}

                <div>
                  <p className="font-semi font-semibold text-text-primary text-sm mb-3">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-extrabold text-4xl text-text-primary">{plan.price}</span>
                    <span className="text-sm text-text-muted">{plan.period}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{plan.description}</p>
                </div>

                <Link
                  href={plan.href}
                  className={[
                    'block w-full rounded-md py-2.5 text-center text-sm font-semi font-semibold transition-all',
                    plan.highlight
                      ? 'bg-amber-500 text-dark-900 hover:bg-amber-400'
                      : 'border border-dark-border-med bg-dark-900 text-text-primary hover:bg-dark-700',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-muted line-through">
                      <span className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center text-dark-500">–</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-text-muted">
            Todos os planos incluem SSL, backups diários e suporte por e-mail.
            Preços em BRL. Cobrado mensalmente.
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
        />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl border border-amber-500/30 bg-amber-500/10 mx-auto">
            <Users className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary mb-4">
            Pronto para parar de perder equipamento?
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Junte-se a centenas de produtores e equipes que já usam o EventGear.
            Comece hoje, de graça.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-base font-semi font-semibold text-dark-900 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#precos"
              className="inline-flex items-center gap-2 rounded-md border border-dark-border-med bg-dark-800 px-6 py-3 text-base font-semi font-semibold text-text-primary hover:bg-dark-700 transition-all"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-dark-border bg-dark-900 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLockup size="sm" />
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
              <Link href="/login" className="hover:text-text-secondary transition-colors">Entrar</Link>
              <Link href="/register" className="hover:text-text-secondary transition-colors">Criar conta</Link>
              <Link href="#precos" className="hover:text-text-secondary transition-colors">Preços</Link>
              <a href="mailto:contato@eventgear.com.br" className="hover:text-text-secondary transition-colors">Contato</a>
            </div>
            <p className="text-xs text-text-muted whitespace-nowrap">
              &copy; {new Date().getFullYear()} ScantelburyDevs
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
