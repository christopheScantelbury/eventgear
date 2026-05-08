'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Building2, User as UserIcon, X } from 'lucide-react';
import { customersApi, type Customer } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface Props {
  value?: string | null;          // customerId
  fallback?: string | null;       // texto livre (cliente sem cadastro)
  onChange: (customerId: string | null, customerName: string | null) => void;
}

export function CustomerPicker({ value, fallback, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: customer } = useQuery({
    queryKey: ['customer', value],
    queryFn: () => customersApi.get(value!),
    enabled: !!value,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['customers', 'picker', search],
    queryFn: () => customersApi.list({ search: search || undefined, limit: 10 }),
    enabled: open,
  });

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Cliente selecionado (do banco)
  if (value && customer) {
    return (
      <div className="flex items-center gap-2 bg-dark-900 border border-amber-500/30 rounded-md px-3 py-2.5">
        {customer.type === 'PJ'
          ? <Building2 size={14} className="text-amber-400 shrink-0" />
          : <UserIcon size={14} className="text-amber-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semi font-semibold text-text-primary truncate">{customer.name}</p>
          {customer.document && (
            <p className="text-xs text-text-muted truncate">{customer.document}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-text-muted hover:text-status-lost transition-colors"
          aria-label="Remover cliente"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Texto livre (fallback) — cliente sem cadastro
  if (fallback && !open) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-dark-900 border border-dark-border-med rounded-md px-3 py-2.5">
          <UserIcon size={14} className="text-text-muted shrink-0" />
          <p className="flex-1 text-sm text-text-secondary truncate">{fallback}</p>
          <span className="text-[10px] font-mono uppercase text-text-muted bg-dark-700 px-1.5 py-0.5 rounded">
            sem cadastro
          </span>
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-text-muted hover:text-status-lost transition-colors"
            aria-label="Limpar"
          >
            <X size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Vincular a cliente cadastrado →
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 bg-dark-900 border border-dark-border-med hover:border-amber-500/40 rounded-md px-3 py-2.5 text-sm text-text-muted transition-colors"
        >
          <Search size={14} />
          Selecionar cliente…
        </button>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nome, CNPJ, email…"
              className="pl-9"
            />
          </div>

          <div className="absolute z-30 mt-1 w-full bg-dark-800 border border-dark-border rounded-lg shadow-xl max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-text-muted py-4 text-center">Buscando…</p>
            ) : !list || list.items.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-text-muted mb-3">
                  {search ? 'Nenhum cliente encontrado' : 'Comece a digitar para buscar'}
                </p>
                <Link href="/clientes/novo" target="_blank" className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                  <Plus size={12} /> Cadastrar novo cliente
                </Link>
              </div>
            ) : (
              <ul className="py-1">
                {list.items.map((c: Customer) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c.id, c.name);
                        setOpen(false);
                        setSearch('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-dark-700 transition-colors flex items-center gap-2"
                    >
                      {c.type === 'PJ'
                        ? <Building2 size={13} className="text-amber-400 shrink-0" />
                        : <UserIcon size={13} className="text-amber-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semi font-semibold text-text-primary truncate">{c.name}</p>
                        {(c.document || c.email) && (
                          <p className="text-xs text-text-muted truncate">{c.document || c.email}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
                <li className="border-t border-dark-border">
                  <Link
                    href="/clientes/novo"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Plus size={12} /> Cadastrar novo cliente
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
