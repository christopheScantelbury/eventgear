'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BrandLockup } from '@/components/brand/logo';
import {
  Package,
  CalendarDays,
  QrCode,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

/* ─── Planos ─────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Básico',
    price: 'R$ 79',
    period: 'por conta / mês',
    description: 'Para quem está começando a organizar eventos.',
    highlight: false,
    cta: 'Começar 1 mês grátis',
    href: '/register?plan=basico',
    features: [
      '3 usuários',
      'Até 200 equipamentos',
      'Até 20 eventos / mês',
      'Checklist com QR Code',
      'Relatórios básicos',
    ],
    missing: ['Exportação PDF', 'Usuários ilimitados', 'Suporte prioritário'],
  },
  {
    name: 'Pro',
    price: 'R$ 149',
    period: 'por conta / mês',
    description: 'Para equipes que trabalham com eventos regularmente.',
    highlight: true,
    cta: 'Começar 1 mês grátis',
    href: '/register?plan=pro',
    features: [
      '10 usuários',
      'Equipamentos ilimitados',
      'Eventos ilimitados',
      'Checklist com QR Code',
      'Relatórios completos + PDF',
      'Suporte prioritário',
    ],
    missing: ['Múltiplas unidades'],
  },
  {
    name: 'Business',
    price: 'R$ 249',
    period: 'por conta / mês',
    description: 'Para empresas com múltiplas equipes e alto volume.',
    highlight: false,
    cta: 'Começar 1 mês grátis',
    href: '/register?plan=business',
    features: [
      '25 usuários',
      'Equipamentos ilimitados',
      'Eventos ilimitados',
      'Checklist com QR Code',
      'Relatórios completos + PDF',
      'Múltiplas unidades / filiais',
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
    body: 'Cadastre microfones, câmeras, cabos, palcos e qualquer item. Organize por categoria, controle o estado e o histórico de cada peça.',
  },
  {
    icon: CalendarDays,
    title: 'Gestão de Eventos',
    body: 'Crie eventos, associe os equipamentos necessários e acompanhe tudo em um só lugar. Nunca mais esqueça um item.',
  },
  {
    icon: QrCode,
    title: 'Checklist por QR Code',
    body: 'Cada equipamento tem seu QR Code único. Na saída e no retorno, basta escanear — rápido, rastreável, sem papel.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Histórico',
    body: 'Veja quais equipamentos saem mais, eventos com itens pendentes e exporte relatórios PDF para clientes ou seguros.',
  },
];

/* ─── FAQ ─────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Preciso instalar algum aplicativo?',
    a: 'Não. O EventGear roda 100% no navegador, inclusive no celular. Basta acessar o link e escanear os QR Codes pela câmera.',
  },
  {
    q: 'Como funciona o QR Code dos equipamentos?',
    a: 'Cada equipamento cadastrado gera um QR Code único. Você imprime e cola no item. Na saída e no retorno do evento, o operador escaneia e o sistema registra automaticamente.',
  },
  {
    q: 'O teste gratuito tem limite de tempo?',
    a: 'Sim. Todos os planos incluem 1 mês grátis sem cartão de crédito. Após o período de teste, você escolhe o plano que melhor se encaixa no seu uso — ou cancela sem custo.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Não há fidelidade. Cancele a qualquer momento pelo painel — sem burocracia.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLockup size="md" />

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-gray-900 transition-colors">Preços</a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
            >
              Começar grátis
            </Link>
          </div>

          {/* mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#funcionalidades" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-1">Funcionalidades</a>
            <a href="#precos" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-1">Preços</a>
            <hr className="border-gray-100" />
            <Link href="/login" className="block text-sm font-medium text-gray-700 py-1">Entrar</Link>
            <Link
              href="/register"
              className="block w-full text-center rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Começar grátis
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="pt-16 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* left: text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Controle de Equipamentos para Eventos
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight text-gray-900">
                Pare de perder{' '}
                <span className="text-amber-500">equipamento</span>{' '}
                em evento.
              </h1>

              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-lg">
                Cadastre, organize e rastreie equipamentos com checklist por QR Code.
                Saiba o que saiu, o que voltou e o que ficou — tudo no celular, sem papel.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Começar 1 mês grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Já tenho conta
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
                {['Sem cartão de crédito', '1 mês grátis', 'Cancele quando quiser'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* right: app mockup */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-gray-900 shadow-2xl overflow-hidden">
                {/* window chrome */}
                <div className="flex items-center gap-1.5 border-b border-gray-700 bg-gray-950 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  <div className="ml-4 flex-1 rounded bg-gray-800 px-3 py-1 text-xs text-gray-400 font-mono">
                    eventgear.app/dashboard
                  </div>
                </div>
                {/* mock content */}
                <div className="p-5 bg-gray-900">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'Equipamentos', value: '247', color: 'text-amber-400' },
                      { label: 'Eventos', value: '8', color: 'text-green-400' },
                      { label: 'Fora', value: '34', color: 'text-blue-400' },
                      { label: 'Pendentes', value: '2', color: 'text-red-400' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-gray-800 p-3 border border-gray-700">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-700 text-xs font-semibold text-gray-400">
                      Movimentos de hoje
                    </div>
                    {[
                      { name: 'Caixa de Som JBL 15"', event: 'Festival Norte', status: 'Fora', c: 'text-amber-400' },
                      { name: 'Microfone Shure SM58', event: 'Show Aniversário', status: 'Devolvido', c: 'text-green-400' },
                      { name: 'Mesa de Som Yamaha', event: 'Corporativo', status: 'Fora', c: 'text-amber-400' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/50 last:border-0">
                        <div>
                          <p className="text-xs font-medium text-gray-200">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.event}</p>
                        </div>
                        <span className={`text-[10px] font-semibold font-mono ${item.c}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* glow */}
              <div aria-hidden className="absolute -z-10 bottom-0 right-0 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Números ────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <dl className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '5.000+', label: 'Equipamentos controlados' },
              { value: '1.200+', label: 'Eventos realizados' },
              { value: 'Zero', label: 'Papel usado' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="font-display font-extrabold text-3xl sm:text-4xl text-amber-500">{s.value}</dt>
                <dd className="mt-1 text-sm text-gray-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Funcionalidades ────────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">FUNCIONALIDADES</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900">
              Tudo que você precisa em um lugar
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Sem planilha, sem WhatsApp, sem papel. Do cadastro ao checklist final.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">COMO FUNCIONA</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900">
              Em três passos, tudo sob controle
            </h2>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-8">
            <div aria-hidden className="hidden sm:block absolute top-9 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px bg-gradient-to-r from-amber-300/50 via-amber-400 to-amber-300/50" />
            {[
              {
                step: '01',
                title: 'Cadastre seus equipamentos',
                body: 'Adicione nome, categoria, número de série e foto. O QR Code é gerado automaticamente.',
              },
              {
                step: '02',
                title: 'Monte o evento',
                body: 'Crie o evento, selecione os equipamentos e defina a equipe. Tudo em minutos.',
              },
              {
                step: '03',
                title: 'Escaneia, vai e volta',
                body: 'Use o scanner no celular. Na saída e no retorno, tudo registrado em segundos.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="relative text-center">
                <div className="relative mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-200 bg-white shadow-sm">
                  <span className="font-display font-extrabold text-2xl text-amber-500">{step}</span>
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preços ─────────────────────────────────────────────── */}
      <section id="precos" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">PREÇOS</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900">
              Simples. Justo. Sem surpresa.
            </h2>
            <p className="mt-4 text-gray-500">
              Comece grátis. Escale quando precisar. Cancele a qualquer hora.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'rounded-2xl border p-7 flex flex-col gap-5',
                  plan.highlight
                    ? 'border-amber-400 bg-white shadow-xl shadow-amber-100 relative ring-1 ring-amber-400/50'
                    : 'border-gray-200 bg-white',
                ].join(' ')}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    Mais popular
                  </span>
                )}

                <div>
                  <p className="font-semibold text-gray-900 mb-3">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-extrabold text-4xl text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>

                <Link
                  href={plan.href}
                  className={[
                    'block w-full rounded-md py-2.5 text-center text-sm font-semibold transition-colors',
                    plan.highlight
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300 line-through">
                      <span className="h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Todos os planos incluem SSL, backups diários e suporte por e-mail.
            Preços em BRL. Cobrado mensalmente.
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">PERGUNTAS FREQUENTES</p>
            <h2 className="font-display font-extrabold text-3xl text-gray-900">Tem dúvidas?</h2>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
            Pronto para parar de perder equipamento?
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            14 dias grátis. Sem cartão. Configuração em minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-white hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Criar conta gratuita
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 bg-gray-900 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-1">
              <BrandLockup size="sm" />
              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                Gestão de equipamentos para eventos com checklist por QR Code.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">PRODUTO</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#funcionalidades" className="hover:text-gray-300 transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-gray-300 transition-colors">Preços</a></li>
                <li><Link href="/register" className="hover:text-gray-300 transition-colors">Criar conta</Link></li>
                <li><Link href="/login" className="hover:text-gray-300 transition-colors">Entrar</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">EMPRESA</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="mailto:contato@eventgear.com.br" className="hover:text-gray-300 transition-colors">Suporte</a></li>
                <li><span className="text-gray-600">Privacidade</span></li>
                <li><span className="text-gray-600">Termos de uso</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 EventGear · Todos os direitos reservados</p>
            <p className="text-xs text-gray-600">eventgear.app</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
