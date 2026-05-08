'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const schema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório'),
    startDate: z.string().min(1, 'Data de início obrigatória'),
    returnDate: z.string().min(1, 'Data de retorno obrigatória'),
    location: z.string().optional(),
    client: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => new Date(d.returnDate) >= new Date(d.startDate), {
    message: 'Data de retorno deve ser após o início',
    path: ['returnDate'],
  });
type FormData = z.infer<typeof schema>;

const textareaClass =
  'flex w-full rounded-md px-3.5 py-2.5 text-sm bg-dark-950 text-text-primary border border-dark-border-med placeholder:text-text-muted focus:outline-none focus:border-amber-600 focus:ring-[3px] focus:ring-amber-500/12 transition-colors';

export default function NovoEventoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: (event) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast('Evento criado!', 'success');
      router.push(`/eventos/${event.id}`);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link
        href="/eventos"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Voltar
      </Link>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-6">
        Novo Evento
      </h1>

      <form
        onSubmit={handleSubmit((d) => mutate(d))}
        className="space-y-4 bg-dark-800 rounded-xl border border-dark-border p-6"
      >
        <div>
          <Label htmlFor="name">Nome do evento *</Label>
          <Input
            id="name"
            placeholder="ex: Show Rock Festival"
            state={errors.name ? 'error' : 'default'}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-status-lost">{errors.name.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Data de início *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              state={errors.startDate ? 'error' : 'default'}
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-status-lost">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="returnDate">Data de retorno *</Label>
            <Input
              id="returnDate"
              type="datetime-local"
              state={errors.returnDate ? 'error' : 'default'}
              {...register('returnDate')}
            />
            {errors.returnDate && (
              <p className="mt-1 text-xs text-status-lost">{errors.returnDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Local</Label>
            <Input id="location" placeholder="Cidade ou venue" {...register('location')} />
          </div>
          <div>
            <Label htmlFor="client">Cliente</Label>
            <Input id="client" placeholder="Nome do cliente" {...register('client')} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            rows={3}
            className={textareaClass}
            placeholder="Notas internas..."
            {...register('notes')}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="w-4 h-4 text-dark-900" />}
            Criar evento
          </Button>
          <Link href="/eventos">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
