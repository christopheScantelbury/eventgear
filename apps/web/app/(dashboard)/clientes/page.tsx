'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Building2, User as UserIcon, Phone, Mail, Hash } from 'lucide-react';
import Link from 'next/link';
import { customersApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, limit: 20, search: search || undefined }),
  });

  const customers = data?.items ?? [];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            Clientes
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {data?.total ?? 0} {(data?.total ?? 0) === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <Link href="/clientes/novo">
          <Button size="sm">
            <Plus size={14} /> Novo cliente
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          type="search"
          placeholder="Buscar por nome, CNPJ, email ou telefone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-dark-800 border border-dark-border rounded-xl py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Building2 size={26} className="text-amber-400" />
          </div>
          <h3 className="font-display text-lg font-bold text-text-primary mb-1">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </h3>
          <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
            {search
              ? 'Tente ajustar os termos da busca.'
              : 'Cadastre clientes para vincular aos eventos e manter um histórico de locações.'}
          </p>
          {!search && (
            <Link href="/clientes/novo">
              <Button size="sm">
                <Plus size={14} /> Cadastrar primeiro cliente
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              className="bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-amber-500/40 hover:bg-dark-800/80 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  {c.type === 'PJ' ? (
                    <Building2 size={16} className="text-amber-400" />
                  ) : (
                    <UserIcon size={16} className="text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semi font-semibold text-sm text-text-primary truncate group-hover:text-amber-400 transition-colors">
                      {c.name}
                    </p>
                    <span className="shrink-0 text-[10px] font-mono uppercase text-text-muted bg-dark-700 px-1.5 py-0.5 rounded">
                      {c.type}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {c.document && (
                      <p className="text-xs text-text-muted flex items-center gap-1.5 truncate">
                        <Hash size={11} /> {formatDoc(c.document, c.type)}
                      </p>
                    )}
                    {c.email && (
                      <p className="text-xs text-text-muted flex items-center gap-1.5 truncate">
                        <Mail size={11} /> {c.email}
                      </p>
                    )}
                    {c.phone && (
                      <p className="text-xs text-text-muted flex items-center gap-1.5 truncate">
                        <Phone size={11} /> {c.phone}
                      </p>
                    )}
                  </div>
                  {c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono text-text-muted uppercase">Eventos</p>
                  <p className="font-display text-lg font-bold text-text-primary">
                    {c._count?.events ?? 0}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-text-muted">
            {page} de {data.totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDoc(doc: string, type: string): string {
  const d = doc.replace(/\D/g, '');
  if (type === 'PJ' && d.length === 14) {
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
  }
  if (type === 'PF' && d.length === 11) {
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
  }
  return doc;
}
