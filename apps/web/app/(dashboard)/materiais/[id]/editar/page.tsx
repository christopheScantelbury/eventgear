'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { materialsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

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

const textareaClass =
  'flex w-full rounded-md px-3.5 py-2.5 text-sm bg-dark-950 text-text-primary border border-dark-border-med placeholder:text-text-muted focus:outline-none focus:border-amber-600 focus:ring-[3px] focus:ring-amber-500/12 transition-colors';

export default function EditarMaterialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: material, isLoading } = useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialsApi.get(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (material) {
      reset({
        name: material.name,
        category: material.category,
        totalQty: material.totalQty,
        description: material.description ?? '',
        brand: material.brand ?? '',
        model: material.model ?? '',
        serialNumber: material.serialNumber ?? '',
        replaceCost: material.replaceCost ? Number(material.replaceCost) : '',
      });
    }
  }, [material, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      materialsApi.update(id, { ...data, replaceCost: data.replaceCost || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials', id] });
      qc.invalidateQueries({ queryKey: ['materials'] });
      toast('Material atualizado com sucesso!', 'success');
      router.push(`/materiais/${id}`);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link
        href={`/materiais/${id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Voltar
      </Link>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-6">
        Editar Material
      </h1>

      <form
        onSubmit={handleSubmit((d) => mutate(d))}
        className="space-y-4 bg-dark-800 rounded-xl border border-dark-border p-6"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              state={errors.name ? 'error' : 'default'}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-status-lost">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select id="category" {...register('category')}>
              <option value="">Selecionar...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="totalQty">Quantidade total *</Label>
            <Input
              id="totalQty"
              type="number"
              min={1}
              state={errors.totalQty ? 'error' : 'default'}
              {...register('totalQty')}
            />
          </div>

          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" {...register('brand')} />
          </div>

          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" {...register('model')} />
          </div>

          <div>
            <Label htmlFor="serialNumber">Número de série</Label>
            <Input id="serialNumber" {...register('serialNumber')} />
          </div>

          <div>
            <Label htmlFor="replaceCost">Custo de reposição (R$)</Label>
            <Input
              id="replaceCost"
              type="number"
              step="0.01"
              min={0}
              {...register('replaceCost')}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={3}
              className={textareaClass}
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="w-4 h-4 text-dark-900" />}
            Salvar alterações
          </Button>
          <Link href={`/materiais/${id}`}>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
