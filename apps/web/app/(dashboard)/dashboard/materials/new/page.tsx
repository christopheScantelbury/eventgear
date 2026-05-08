'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { materialsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  category: z.string().min(1, 'Categoria obrigatória'),
  totalQty: z.coerce.number().int().positive('Quantidade deve ser positiva'),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  replaceCost: z.coerce.number().positive().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = ['AUDIO', 'VIDEO', 'ILUMINACAO', 'ESTRUTURA', 'GERACAO', 'PALCO', 'OUTROS'];

export default function NewMaterialPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => materialsApi.create({
      ...data,
      replaceCost: data.replaceCost || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      toast('Material cadastrado com sucesso!', 'success');
      router.push('/dashboard/materials');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/dashboard/materials"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft size={16} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Material</h1>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="ex: Caixa de som Line Array" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select id="category" {...register('category')}>
              <option value="">Selecionar...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <Label htmlFor="totalQty">Quantidade total *</Label>
            <Input id="totalQty" type="number" min={1} {...register('totalQty')} />
            {errors.totalQty && <p className="mt-1 text-xs text-red-600">{errors.totalQty.message}</p>}
          </div>

          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" placeholder="ex: JBL" {...register('brand')} />
          </div>

          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" placeholder="ex: SRX828SP" {...register('model')} />
          </div>

          <div>
            <Label htmlFor="serialNumber">Número de série</Label>
            <Input id="serialNumber" {...register('serialNumber')} />
          </div>

          <div>
            <Label htmlFor="replaceCost">Custo de reposição (R$)</Label>
            <Input id="replaceCost" type="number" step="0.01" min={0} {...register('replaceCost')} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações sobre o equipamento..."
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 h-11 px-6 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isPending && <Spinner className="w-4 h-4" />}
            Cadastrar material
          </button>
          <Link
            href="/dashboard/materials"
            className="h-11 px-6 flex items-center text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
