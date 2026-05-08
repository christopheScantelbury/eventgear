'use client';

import { useState } from 'react';
import { ChevronLeft, UserPlus, Trash2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

const MOCK_USERS = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@empresa.com', role: 'ADMIN' },
  { id: '2', name: 'Ana Souza', email: 'ana@empresa.com', role: 'OPERATOR' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  OPERATOR: 'Operador',
};

export default function UsuariosPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');

  function handleInvite() {
    if (!email) {
      toast('Informe o e-mail', 'error');
      return;
    }
    toast(`Convite enviado para ${email}`, 'success');
    setEmail('');
    setRole('OPERATOR');
    setInviteOpen(false);
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Configurações
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
          Usuários
        </h1>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} />
          Convidar
        </Button>
      </div>

      <div className="bg-dark-800 border border-dark-border rounded-xl overflow-hidden">
        {MOCK_USERS.map((u, idx) => (
          <div
            key={u.id}
            className={`flex items-center gap-4 px-5 py-4 ${idx < MOCK_USERS.length - 1 ? 'border-b border-dark-border' : ''}`}
          >
            <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-sm text-amber-400">
                {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semi font-semibold text-sm text-text-primary truncate">
                {u.name}
              </p>
              <p className="text-xs text-text-muted truncate">{u.email}</p>
            </div>
            <span className="shrink-0 text-xs font-mono text-text-muted bg-dark-700 px-2 py-0.5 rounded">
              {ROLE_LABELS[u.role] ?? u.role}
            </span>
            {u.email !== user?.email && (
              <button
                onClick={() => toast('Usuário removido', 'success')}
                className="text-text-muted hover:text-status-lost transition-colors p-1 shrink-0"
                aria-label="Remover"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal convidar */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} title="Convidar usuário">
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-email">E-mail</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colaborador@empresa.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="invite-role">Papel</Label>
            <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleInvite}>Enviar convite</Button>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
