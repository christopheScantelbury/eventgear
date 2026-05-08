'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Users, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignora */
    }
    logout();
    router.replace('/login');
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto pb-28">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-6">
        Configurações
      </h1>

      {/* Minha conta */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
          <User size={12} /> Minha conta
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center shrink-0">
            <span className="font-display font-extrabold text-xl text-amber-400">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semi font-semibold text-text-primary truncate">
              {user?.name ?? '—'}
            </p>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Nome completo</Label>
            <Input defaultValue={user?.name ?? ''} placeholder="Seu nome" />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={user?.email ?? ''} disabled readOnly className="opacity-60 cursor-not-allowed" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast('Funcionalidade em breve', 'success')}>
            Alterar senha
          </Button>
        </div>
      </section>

      {/* Empresa */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
          <Building2 size={12} /> Empresa
        </div>
        <div className="space-y-3">
          <div>
            <Label>Nome da empresa</Label>
            <Input placeholder="Nome da sua empresa" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label>Cidade / Estado</Label>
            <Input placeholder="São Paulo, SP" />
          </div>
          <Button onClick={() => toast('Alterações salvas!', 'success')}>
            Salvar alterações
          </Button>
        </div>
      </section>

      {/* Usuários */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
            <Users size={12} /> Usuários
          </div>
          <Link
            href="/configuracoes/usuarios"
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Gerenciar <ChevronRight size={14} />
          </Link>
        </div>
        <p className="text-sm text-text-muted">
          Convide colaboradores e gerencie permissões de acesso.
        </p>
      </section>

      {/* Plano */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
          <CreditCard size={12} /> Plano
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semi font-semibold text-text-primary">Plano Grátis</p>
            <p className="text-sm text-text-muted mt-0.5">Até 50 materiais · 10 eventos/mês</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => toast('Upgrade em breve!', 'success')}>
            Fazer upgrade
          </Button>
        </div>
      </section>

      {/* Rodapé */}
      <div className="text-center py-4 space-y-2">
        <p className="font-mono text-[10px] text-text-muted">EventGear v1.0.0 · ScantelburyDevs</p>
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <a href="#" className="hover:text-text-secondary transition-colors">Termos de Uso</a>
          <span>·</span>
          <a href="#" className="hover:text-text-secondary transition-colors">Política de Privacidade</a>
        </div>
      </div>

      {/* Botão de logout */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-dark-900 border-t border-dark-border md:static md:bg-transparent md:border-0 md:p-0 md:mt-4">
        {confirmLogout ? (
          <div className="flex gap-3">
            <Button block variant="danger" onClick={handleLogout}>
              <LogOut size={16} />
              Confirmar saída
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmLogout(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-status-lost hover:text-red-300 font-medium text-sm transition-colors"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        )}
      </div>
    </div>
  );
}
