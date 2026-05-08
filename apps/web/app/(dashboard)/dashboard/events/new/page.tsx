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
import { useToast } from '@/components/ui/toast';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  returnDate: z.string().min(1, 'Data de retorno obrigatória'),
  location: z.string().optional(),
  client: z.string().optional(),
  notes: z.string().optional(),
}).refine((d) => new Date(d.returnDate) >= new Date(d.startDate), {
  message: 'Data de retorno deve ser após o início',
  path: ['returnDate'],
});
type FormData = z.infer<typeof schema>;

export default function NewEventPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: (event) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast('Evento criado!', 'success');
      router.push(`/dashboard/events/${event.id}`);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft size={16} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Evento</h1>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <Label htmlFor="name">Nome do evento *</Label>
          <Input id="name" placeholder="ex: Show Rock Festival" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Data de início *</Label>
            <Input id="startDate" type="datetime-local" {...register('startDate')} />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="returnDate">Data de retorno *</Label>
            <Input id="returnDate" type="datetime-local" {...register('returnDate')} />
            {errors.returnDate && <p className="mt-1 text-xs text-red-600">{errors.returnDate.message}</p>}
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
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notas internas..."
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 h-11 px-6 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPending && <Spinner className="w-4 h-4" />}
            Criar evento
          </button>
          <Link href="/dashboard/events" className="h-11 px-6 flex items-center text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
