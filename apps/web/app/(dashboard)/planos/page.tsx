'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Crown, Zap, Building2, ExternalLink, AlertCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { billingApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  basico: <Zap size={20} className="text-amber-400" />,
  pro: <Crown size={20} className="text-amber-400" />,
  business: <Building2 size={20} className="text-amber-400" />,
};

const PLAN_HIGHLIGHTS: Record<string, string> = {
  basico: 'Para começar a organizar',
  pro: 'Para equipes que escalam',
  business: 'Para múltiplas unidades',
};

export default function PlanosPage() {
  const { toast } = useToast();
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: billingApi.plans,
  });
  const { data: status } = useQuery({
    queryKey: ['billing-status'],
    queryFn: billingApi.status,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planSlug: string) => billingApi.checkout(planSlug),
    onSuccess: (data) => { window.location.href = data.url; },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast(typeof msg === 'string' ? msg : 'Erro ao criar checkout', 'error');
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => billingApi.portal(),
    onSuccess: (data) => { window.location.href = data.url; },
    onError: () => toast('Erro ao abrir portal', 'error'),
  });

  const currentPlanSlug = status?.plan?.slug;
  const trialEndsAt = status?.subscription?.trialEndsAt
    ?? status?.company?.trialEndsAt
    ?? null;
  const trialActive = trialEndsAt && new Date(trialEndsAt) > new Date();

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
          Planos
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Escolha o plano ideal para o seu volume de eventos. Mude a qualquer momento.
        </p>
      </div>

      {/* Banner de urgência — trial expirado sem plano */}
      {status && !status.plan && !trialActive && (
        <div className="flex items-start gap-3 bg-status-lost/10 border border-status-lost/30 rounded-xl p-4 mb-4">
          <AlertTriangle size={16} className="text-status-lost shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-status-lost">Seu acesso está limitado</p>
            <p className="text-text-secondary mt-0.5">
              O período de trial encerrou. Algumas funcionalidades foram bloqueadas. Assine um plano abaixo para restaurar o acesso completo.
            </p>
          </div>
        </div>
      )}

      {/* Status atual */}
      {status && (
        <div className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1">Plano atual</p>
              {status.plan ? (
                <>
                  <p className="font-display text-xl font-extrabold text-text-primary">{status.plan.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {status.subscription?.status === 'TRIALING' ? 'Em período de teste' :
                     status.subscription?.status === 'ACTIVE'   ? 'Assinatura ativa' :
                     status.subscription?.status === 'PAST_DUE' ? 'Pagamento pendente' :
                     'Sem assinatura ativa'}
                  </p>
                </>
              ) : trialActive ? (
                <>
                  <p className="font-display text-xl font-extrabold text-amber-400">Trial Gratuito</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Termina em {new Date(trialEndsAt!).toLocaleDateString('pt-BR')}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl font-extrabold text-status-lost">Trial encerrado</p>
                  <p className="text-xs text-text-muted mt-0.5">Assine um plano para continuar usando o EventGear</p>
                </>
              )}
            </div>
            {status.plan && status.subscription && (
              <Button size="sm" variant="ghost" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                <ExternalLink size={13} /> {portalMutation.isPending ? 'Abrindo…' : 'Gerenciar pagamento'}
              </Button>
            )}
          </div>

          {/* Uso atual */}
          {status.usage && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-border">
              <UsageBar label="Materiais" current={status.usage.materials} max={status.plan?.maxMaterials ?? 200} />
              <UsageBar label="Eventos / mês" current={status.usage.eventsThisMonth} max={status.plan?.maxEventsPerMonth ?? 20} />
              <UsageBar label="Usuários" current={status.usage.users} max={status.plan?.maxUsers ?? 3} />
            </div>
          )}
        </div>
      )}

      {/* Planos */}
      {loadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      ) : !plans || plans.length === 0 ? (
        <p className="text-text-muted">Nenhum plano disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlanSlug === plan.slug;
            const isPro = plan.slug === 'pro';
            return (
              <div
                key={plan.id}
                className={`relative bg-dark-800 border rounded-2xl p-6 flex flex-col ${
                  isPro ? 'border-amber-500/40 shadow-amber-soft' : 'border-dark-border'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-dark-900 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {PLAN_ICONS[plan.slug]}
                  <h3 className="font-display text-xl font-extrabold text-text-primary">{plan.name}</h3>
                </div>
                <p className="text-xs text-text-muted mb-4">{PLAN_HIGHLIGHTS[plan.slug] ?? plan.description}</p>

                <div className="mb-5">
                  <span className="font-display text-3xl font-extrabold text-text-primary">
                    R$ {Number(plan.priceMonthlyBrl).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-text-muted ml-1">/ mês</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  <Feature
                    label={plan.maxMaterials === -1 ? 'Materiais ilimitados' : `Até ${plan.maxMaterials} materiais`}
                  />
                  <Feature
                    label={plan.maxEventsPerMonth === -1 ? 'Eventos ilimitados' : `${plan.maxEventsPerMonth} eventos / mês`}
                  />
                  <Feature label={`${plan.maxUsers} usuários`} />
                  <Feature label="Checklist com QR Code" />
                  {plan.hasReports && <Feature label="Relatórios completos" />}
                  {plan.hasPdfExport && <Feature label="Exportação em PDF" />}
                  {plan.hasMultiBranch && <Feature label={`Múltiplas filiais (até ${plan.maxBranches})`} />}
                </ul>

                {isCurrent ? (
                  <Button variant="ghost" disabled block>
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    variant={isPro ? 'primary' : 'secondary'}
                    block
                    onClick={() => checkoutMutation.mutate(plan.slug)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Redirecionando…' : trialActive ? 'Assinar com 30 dias grátis' : 'Assinar agora'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ rápido */}
      <div className="mt-8 bg-dark-800/50 border border-dark-border rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary space-y-2">
            <p><strong className="text-text-primary">Como funciona o trial?</strong> Você tem 30 dias para testar todos os recursos do plano Pro. Sem cartão de crédito.</p>
            <p><strong className="text-text-primary">Posso mudar de plano?</strong> Sim, a qualquer momento. Pagamento ajustado proporcionalmente.</p>
            <p><strong className="text-text-primary">Cancelamento?</strong> Sem fidelidade. Cancele com 1 clique no portal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-text-secondary">
      <Check size={14} className="text-status-available shrink-0 mt-0.5" />
      <span>{label}</span>
    </li>
  );
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const unlimited = max === -1;
  const percent = unlimited ? 0 : Math.min(100, (current / Math.max(max, 1)) * 100);
  const danger = !unlimited && percent > 80;

  return (
    <div>
      <p className="text-[10px] font-mono uppercase text-text-muted mb-1">{label}</p>
      <p className="text-sm font-semi font-semibold text-text-primary">
        {current} {unlimited ? '/ ilimitado' : `/ ${max}`}
      </p>
      {!unlimited && (
        <div className="h-1.5 bg-dark-700 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full transition-all ${danger ? 'bg-status-lost' : 'bg-amber-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
