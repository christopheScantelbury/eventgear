'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Pencil, Trash2, Building2, User as UserIcon,
  Mail, Phone, MapPin, Hash, FileText, Calendar,
} from 'lucide-react';
import { customersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { CustomerForm } from '@/components/clientes/customer-form';
import { formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planejado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-dark-700 text-text-secondary',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400',
  COMPLETED: 'bg-status-available/15 text-status-available',
  CANCELLED: 'bg-text-muted/15 text-text-muted',
};

export default function ClientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.remove(id),
    onSuccess: () => {
      toast('Cliente removido', 'success');
      qc.invalidateQueries({ queryKey: ['customers'] });
      router.push('/clientes');
    },
    onError: () => toast('Erro ao remover cliente', 'error'),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) return null;

  if (editing) {
    return <CustomerForm initial={customer} />;
  }

  const totalSpent = (customer.events ?? []).reduce(
    (acc: number, e: any) => acc + (e.totalAmount ? Number(e.totalAmount) : 0),
    0,
  );

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
        <ChevronLeft size={16} /> Clientes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center shrink-0">
            {customer.type === 'PJ'
              ? <Building2 size={22} className="text-amber-400" />
              : <UserIcon size={22} className="text-amber-400" />}
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
              {customer.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono uppercase text-text-muted bg-dark-700 px-2 py-0.5 rounded">
                {customer.type}
              </span>
              {customer.tags?.map((t: string) => (
                <span key={t} className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil size={13} /> Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={13} /> Remover
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase text-text-muted">Eventos</p>
          <p className="font-display text-2xl font-extrabold text-text-primary">
            {customer._count?.events ?? 0}
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase text-text-muted">Faturado</p>
          <p className="font-display text-2xl font-extrabold text-text-primary">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-mono uppercase text-text-muted">Cliente desde</p>
          <p className="font-display text-2xl font-extrabold text-text-primary">
            {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Dados de contato */}
      <div className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">Contato</p>
        <div className="space-y-2 text-sm">
          {customer.document && (
            <Field icon={<Hash size={13} />} label={customer.type === 'PJ' ? 'CNPJ' : 'CPF'} value={customer.document} />
          )}
          {customer.email && <Field icon={<Mail size={13} />} label="E-mail" value={customer.email} />}
          {customer.phone && <Field icon={<Phone size={13} />} label="Telefone" value={customer.phone} />}
          {(customer.address || customer.city) && (
            <Field
              icon={<MapPin size={13} />}
              label="Endereço"
              value={[customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ')}
            />
          )}
          {customer.notes && <Field icon={<FileText size={13} />} label="Observações" value={customer.notes} />}
        </div>
      </div>

      {/* Histórico de eventos */}
      <div className="bg-dark-800 border border-dark-border rounded-xl p-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">
          Histórico de eventos · {customer.events?.length ?? 0}
        </p>
        {!customer.events || customer.events.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">Nenhum evento ainda.</p>
        ) : (
          <div className="space-y-2">
            {customer.events.map((e: any) => (
              <Link
                key={e.id}
                href={`/eventos/${e.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-dark-border hover:border-amber-500/30 hover:bg-dark-700/30 transition-all"
              >
                <Calendar size={14} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary truncate">{e.name}</p>
                  <p className="text-xs text-text-muted">
                    {formatDate(e.startDate)} — {formatDate(e.returnDate)}
                  </p>
                </div>
                {e.totalAmount && (
                  <p className="text-xs font-mono text-text-secondary shrink-0">
                    R$ {Number(e.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${STATUS_COLORS[e.status]}`}>
                  {STATUS_LABELS[e.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Remover cliente">
        <p className="text-sm text-text-secondary mb-5">
          Tem certeza que deseja remover <strong>{customer.name}</strong>? Os eventos passados serão preservados.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Removendo…' : 'Remover'}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
        </div>
      </Dialog>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-muted mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase text-text-muted">{label}</p>
        <p className="text-sm text-text-primary break-words">{value}</p>
      </div>
    </div>
  );
}
