import type { UserRole } from '@/store/auth.store';

// ── Módulos do sistema ────────────────────────────────────────────
export type AppModule =
  | 'dashboard'
  | 'materiais'
  | 'eventos'
  | 'clientes'
  | 'calendario'
  | 'relatorios'
  | 'configuracoes'
  | 'usuarios';

// ── Nível de acesso ───────────────────────────────────────────────
export type AccessLevel = 'FULL' | 'VIEW' | 'NONE';

// ── Mapa de permissões por role ───────────────────────────────────
const ROLE_PERMISSIONS: Record<UserRole, Record<AppModule, AccessLevel>> = {
  ADMIN: {
    dashboard:    'FULL',
    materiais:    'FULL',
    eventos:      'FULL',
    clientes:     'FULL',
    calendario:   'FULL',
    relatorios:   'FULL',
    configuracoes:'FULL',
    usuarios:     'FULL',
  },
  OPERATOR: {
    dashboard:    'VIEW',
    materiais:    'FULL',
    eventos:      'FULL',
    clientes:     'FULL',
    calendario:   'VIEW',
    relatorios:   'VIEW',
    configuracoes:'NONE',
    usuarios:     'NONE',
  },
};

export function getAccess(role: UserRole | undefined, module: AppModule): AccessLevel {
  if (!role) return 'NONE';
  return ROLE_PERMISSIONS[role]?.[module] ?? 'NONE';
}

export function canAccess(role: UserRole | undefined, module: AppModule): boolean {
  return getAccess(role, module) !== 'NONE';
}

export function canEdit(role: UserRole | undefined, module: AppModule): boolean {
  return getAccess(role, module) === 'FULL';
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'ADMIN';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:    'Admin',
  OPERATOR: 'Operador',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  OPERATOR: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};
