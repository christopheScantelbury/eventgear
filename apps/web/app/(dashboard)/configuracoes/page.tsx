'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Users, CreditCard, LogOut, ChevronRight, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { isAdmin } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const { toast } = useToast();

  // Perfil
  const [name, setName] = useState(user?.name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Senha
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // Logout
  const [confirmLogout, setConfirmLogout] = useState(false);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleSaveProfile() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({ name: trimmed });
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, name: updated.name }, accessToken, refreshToken);
      }
      toast('Nome atualizado com sucesso', 'success');
    } catch {
      toast('Erro ao salvar alterações', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) {
      toast('Preencha todos os campos', 'error'); return;
    }
    if (newPw.length < 8) {
      toast('Nova senha deve ter ao menos 8 caracteres', 'error'); return;
    }
    if (newPw !== confirmPw) {
      toast('As senhas não coincidem', 'error'); return;
    }
    setSavingPw(true);
    try {
      await authApi.updateProfile({ currentPassword: currentPw, newPassword: newPw });
      toast('Senha alterada com sucesso', 'success');
      setPwOpen(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast(typeof msg === 'string' ? msg : 'Senha atual incorreta', 'error');
    } finally {
      setSavingPw(false);
    }
  }

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignora */ }
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
            <p className="font-semi font-semibold text-text-primary truncate">{user?.name ?? '—'}</p>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="profile-name">Nome completo</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              value={user?.email ?? ''}
              disabled
              readOnly
              className="opacity-60 cursor-not-allowed"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile || name.trim() === user?.name}
            >
              {savingProfile ? 'Salvando…' : 'Salvar nome'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPwOpen(true)}>
              <KeyRound size={13} />
              Alterar senha
            </Button>
          </div>
        </div>
      </section>

      {/* Empresa */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
          <Building2 size={12} /> Empresa
        </div>
        <p className="text-sm text-text-muted">
          {user?.companyName ?? 'Sua empresa'}
        </p>
      </section>

      {/* Usuários — somente admin */}
      {isAdmin(user?.role) && (
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
            Adicione colaboradores e controle os papéis de acesso de cada um.
          </p>
        </section>
      )}

      {/* Plano */}
      <section className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-4">
          <CreditCard size={12} /> Plano
        </div>
      </section>

      {/* Rodapé */}
      <div className="text-center py-4 space-y-2">
        <p className="font-mono text-[10px] text-text-muted">EventGear v1.0.0</p>
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <a href="#" className="hover:text-text-secondary transition-colors">Termos de Uso</a>
          <span>·</span>
          <a href="#" className="hover:text-text-secondary transition-colors">Política de Privacidade</a>
        </div>
      </div>

      {/* Logout */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-dark-900 border-t border-dark-border md:static md:bg-transparent md:border-0 md:p-0 md:mt-4">
        {confirmLogout ? (
          <div className="flex gap-3">
            <Button block variant="danger" onClick={handleLogout}>
              <LogOut size={16} /> Confirmar saída
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
            <LogOut size={16} /> Sair da conta
          </button>
        )}
      </div>

      {/* Modal alterar senha */}
      <Dialog open={pwOpen} onClose={() => { setPwOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }} title="Alterar senha">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pw-current">Senha atual</Label>
            <Input id="pw-current" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="pw-new">Nova senha</Label>
            <Input id="pw-new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Mínimo 8 caracteres" />
          </div>
          <div>
            <Label htmlFor="pw-confirm">Confirmar nova senha</Label>
            <Input id="pw-confirm" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repita a nova senha" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={handleChangePassword} disabled={savingPw}>
              {savingPw ? 'Salvando…' : 'Alterar senha'}
            </Button>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
