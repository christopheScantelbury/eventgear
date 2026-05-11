'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, UserPlus, Trash2, Pencil, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usersApi } from '@/lib/api';
import { ROLE_LABELS, ROLE_COLORS, isAdmin } from '@/lib/permissions';
import type { UserRole } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const { user: me } = useAuthStore();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal criar
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('OPERATOR');

  // Inline edit role
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('OPERATOR');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redireciona se não for admin
  useEffect(() => {
    if (me && !isAdmin(me.role)) {
      router.replace('/dashboard');
    }
  }, [me, router]);

  async function load() {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      toast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Criar usuário ──────────────────────────────────────────────
  async function handleCreate() {
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Preencha todos os campos');
      return;
    }
    if (newPassword.length < 8) {
      setCreateError('Senha deve ter ao menos 8 caracteres');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await usersApi.create({ name: newName.trim(), email: newEmail.trim(), password: newPassword, role: newRole });
      toast('Usuário criado com sucesso', 'success');
      setCreateOpen(false);
      resetCreateForm();
      load();
    } catch (e: unknown) {
      const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : (typeof raw === 'string' ? raw : 'Erro ao criar usuário');
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  function resetCreateForm() {
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('OPERATOR'); setCreateError(null);
  }

  // ── Editar role inline ─────────────────────────────────────────
  function startEdit(u: UserItem) {
    setEditingId(u.id);
    setEditRole(u.role);
  }

  async function confirmEdit(id: string) {
    setSaving(true);
    try {
      await usersApi.update(id, { role: editRole });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: editRole } : u));
      toast('Papel atualizado', 'success');
      setEditingId(null);
    } catch {
      toast('Erro ao atualizar papel', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Remover usuário ────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await usersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast('Usuário removido', 'success');
      setDeleteId(null);
    } catch {
      toast('Erro ao remover usuário', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  if (!me || !isAdmin(me.role)) return null;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Configurações
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            Usuários
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {users.length} {users.length === 1 ? 'colaborador' : 'colaboradores'} na empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-dark-800 transition-colors"
            aria-label="Recarregar"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus size={14} />
            Novo usuário
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-dark-800 border border-dark-border rounded-xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">Carregando…</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">Nenhum usuário encontrado.</div>
        ) : (
          users.map((u, idx) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${idx < users.length - 1 ? 'border-b border-dark-border' : ''}`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-xs text-amber-400">
                  {initials(u.name)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semi font-semibold text-sm text-text-primary truncate">
                  {u.name}
                  {u.id === me?.id && (
                    <span className="ml-2 text-[10px] font-mono text-text-muted">(você)</span>
                  )}
                </p>
                <p className="text-xs text-text-muted truncate">{u.email}</p>
              </div>

              {/* Role — inline edit para outros usuários */}
              {editingId === u.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="text-xs py-1 h-auto"
                  >
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <button
                    onClick={() => confirmEdit(u.id)}
                    disabled={saving}
                    className="p-1.5 rounded text-status-available hover:bg-status-available/10 transition-colors disabled:opacity-40"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-mono font-semibold border px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  {u.id !== me?.id && (
                    <button
                      onClick={() => startEdit(u)}
                      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-dark-700 transition-colors"
                      aria-label="Editar papel"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Remover */}
              {u.id !== me?.id && editingId !== u.id && (
                <button
                  onClick={() => setDeleteId(u.id)}
                  className="p-1.5 rounded text-text-muted hover:text-status-lost hover:bg-status-lost/10 transition-colors shrink-0"
                  aria-label="Remover usuário"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Legenda de papéis */}
      <div className="mt-6 bg-dark-800 border border-dark-border rounded-xl p-4">
        <p className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted mb-3">Papéis do sistema</p>
        <div className="space-y-2.5">
          {(['ADMIN', 'OPERATOR'] as UserRole[]).map((role) => (
            <div key={role} className="flex items-start gap-3">
              <span className={`text-[11px] font-mono font-semibold border px-2 py-0.5 rounded-full shrink-0 ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                {role === 'ADMIN'
                  ? 'Acesso total: gerencia usuários, configurações, materiais, eventos e relatórios.'
                  : 'Acesso operacional: cria e edita materiais e eventos, visualiza relatórios. Sem acesso a configurações.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: criar usuário */}
      <Dialog open={createOpen} onClose={() => { setCreateOpen(false); resetCreateForm(); }} title="Novo usuário">
        <div className="space-y-4">
          {createError && (
            <div className="flex items-start gap-2 bg-status-lost/10 border border-status-lost/30 rounded-lg px-3 py-2.5 text-sm">
              <AlertCircle size={15} className="text-status-lost shrink-0 mt-0.5" />
              <p className="text-status-lost">{createError}</p>
            </div>
          )}
          <div>
            <Label htmlFor="new-name">Nome completo</Label>
            <Input
              id="new-name"
              placeholder="Ex: Maria Santos"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-email">E-mail</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="maria@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-password">Senha inicial</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-role">Papel</Label>
            <Select id="new-role" value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
              <option value="OPERATOR">Operador — acesso operacional</option>
              <option value="ADMIN">Admin — acesso total</option>
            </Select>
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Criando…' : 'Criar usuário'}
            </Button>
            <Button variant="ghost" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal: confirmar remoção */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remover usuário"
      >
        <p className="text-sm text-text-secondary mb-5">
          Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleting}>
            {deleting ? 'Removendo…' : 'Remover'}
          </Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
        </div>
      </Dialog>
    </div>
  );
}
