'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { customersApi, type Customer, type CustomerType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

interface Props {
  initial?: Customer;
}

export function CustomerForm({ initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Customer>>(
    initial ?? {
      name: '',
      type: 'PJ',
      document: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      tags: [],
    },
  );
  const [tagInput, setTagInput] = useState('');

  const isEdit = !!initial;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.name?.trim()) throw new Error('Nome é obrigatório');
      const payload = {
        ...form,
        document: form.document?.replace(/\D/g, '') || undefined,
      };
      if (isEdit) return customersApi.update(initial!.id, payload);
      return customersApi.create(payload);
    },
    onSuccess: (data) => {
      toast(isEdit ? 'Cliente atualizado' : 'Cliente cadastrado', 'success');
      router.push(`/clientes/${data.id}`);
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (e as Error)?.message;
      toast(typeof msg === 'string' ? msg : 'Erro ao salvar', 'error');
    },
  });

  function set<K extends keyof Customer>(key: K, value: Customer[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags?.includes(t)) return;
    set('tags', [...(form.tags ?? []), t]);
    setTagInput('');
  }

  function removeTag(t: string) {
    set('tags', (form.tags ?? []).filter((x) => x !== t));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-6">
        {isEdit ? 'Editar cliente' : 'Novo cliente'}
      </h1>

      <div className="bg-dark-800 border border-dark-border rounded-xl p-5 space-y-4">
        {/* Tipo + Nome */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="cust-type">Tipo</Label>
            <Select
              id="cust-type"
              value={form.type ?? 'PJ'}
              onChange={(e) => set('type', e.target.value as CustomerType)}
            >
              <option value="PJ">Pessoa Jurídica</option>
              <option value="PF">Pessoa Física</option>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="cust-name">{form.type === 'PJ' ? 'Razão social' : 'Nome completo'} *</Label>
            <Input
              id="cust-name"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              placeholder={form.type === 'PJ' ? 'Empresa LTDA' : 'João da Silva'}
            />
          </div>
        </div>

        {/* Documento + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cust-doc">{form.type === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
            <Input
              id="cust-doc"
              value={form.document ?? ''}
              onChange={(e) => set('document', e.target.value)}
              placeholder={form.type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'}
            />
          </div>
          <div>
            <Label htmlFor="cust-email">E-mail</Label>
            <Input
              id="cust-email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>
        </div>

        {/* Telefone */}
        <div>
          <Label htmlFor="cust-phone">Telefone</Label>
          <Input
            id="cust-phone"
            value={form.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Endereço */}
        <div>
          <Label htmlFor="cust-addr">Endereço</Label>
          <Input
            id="cust-addr"
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Rua das Flores, 123"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="cust-city">Cidade</Label>
            <Input
              id="cust-city"
              value={form.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              placeholder="São Paulo"
            />
          </div>
          <div>
            <Label htmlFor="cust-state">UF</Label>
            <Input
              id="cust-state"
              value={form.state ?? ''}
              onChange={(e) => set('state', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cust-zip">CEP</Label>
          <Input
            id="cust-zip"
            value={form.zipCode ?? ''}
            onChange={(e) => set('zipCode', e.target.value)}
            placeholder="00000-000"
          />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="vip, recorrente, devedor…"
            />
            <Button type="button" size="sm" variant="ghost" onClick={addTag}>Adicionar</Button>
          </div>
          {form.tags && form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => removeTag(t)}
                  className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  {t} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notas */}
        <div>
          <Label htmlFor="cust-notes">Observações</Label>
          <textarea
            id="cust-notes"
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className="w-full bg-dark-900 border border-dark-border-med rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500/50"
            placeholder="Notas internas sobre o cliente, condições especiais…"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
