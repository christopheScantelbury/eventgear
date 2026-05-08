'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Search, Printer, Package } from 'lucide-react';
import Link from 'next/link';
import { materialsApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const TAMANHOS = [
  { value: '50x30', label: '50 × 30 mm' },
  { value: '62x30', label: '62 × 30 mm' },
  { value: '100x50', label: '100 × 50 mm' },
] as const;

export default function EtiquetasPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tamanho, setTamanho] = useState<string>('62x30');
  const [incluirNome, setIncluirNome] = useState(true);
  const [incluirCategoria, setIncluirCategoria] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['materials', 'all', search],
    queryFn: () => materialsApi.list({ limit: 100, search: search || undefined }),
  });

  const materials = data?.items ?? [];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(materials.map((m: any) => m.id)));
  }

  function handleGerar() {
    if (selected.size === 0) {
      toast('Selecione ao menos um material', 'error');
      return;
    }
    const ids = Array.from(selected).join(',');
    window.open(
      `/api/materiais/etiquetas?ids=${ids}&tamanho=${tamanho}&nome=${incluirNome}&categoria=${incluirCategoria}`,
      '_blank',
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <Link
        href="/materiais"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Materiais
      </Link>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-6">
        Impressão de Etiquetas
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seleção */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted font-mono">
              {selected.size} materiais selecionados
            </span>
            <button
              onClick={selectAll}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Selecionar todos
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-dark-800 border border-dark-border rounded-xl">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum material encontrado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {materials.map((m: any) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 bg-dark-800 border border-dark-border rounded-xl cursor-pointer hover:border-dark-border-med transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semi font-semibold text-sm text-text-primary truncate">
                      {m.name}
                    </p>
                    <p className="font-mono text-xs text-text-muted">{m.category}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Configuração */}
        <div className="space-y-4">
          <div className="bg-dark-800 border border-dark-border rounded-xl p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
              Configuração
            </h2>

            <div className="mb-4">
              <p className="text-sm font-medium text-text-secondary mb-2">Tamanho</p>
              <div className="space-y-2">
                {TAMANHOS.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tamanho"
                      value={t.value}
                      checked={tamanho === t.value}
                      onChange={() => setTamanho(t.value)}
                      className="accent-amber-500"
                    />
                    <span className="text-sm text-text-primary">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-dark-border pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirNome}
                  onChange={(e) => setIncluirNome(e.target.checked)}
                  className="accent-amber-500"
                />
                <span className="text-sm text-text-primary">Incluir nome</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirCategoria}
                  onChange={(e) => setIncluirCategoria(e.target.checked)}
                  className="accent-amber-500"
                />
                <span className="text-sm text-text-primary">Incluir categoria</span>
              </label>
            </div>
          </div>

          <Button block onClick={handleGerar} disabled={selected.size === 0}>
            <Printer size={16} />
            Gerar PDF para impressão
          </Button>
        </div>
      </div>
    </div>
  );
}
