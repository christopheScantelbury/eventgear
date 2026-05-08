import { Badge } from './badge';
import { cn } from '@/lib/utils';

type MaterialStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'LOST';
type EventStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ChecklistItemStatus = 'PENDING' | 'CONFIRMED' | 'MISSING' | 'DAMAGED';

const materialMap: Record<MaterialStatus, { variant: 'available' | 'allocated' | 'maintenance' | 'lost'; label: string }> = {
  AVAILABLE: { variant: 'available', label: 'Disponível' },
  ALLOCATED: { variant: 'allocated', label: 'Alocado' },
  MAINTENANCE: { variant: 'maintenance', label: 'Manutenção' },
  LOST: { variant: 'lost', label: 'Extraviado' },
};

const eventMap: Record<EventStatus, { variant: 'planned' | 'in-progress' | 'completed' | 'cancelled'; label: string }> = {
  PLANNED: { variant: 'planned', label: 'Planejado' },
  IN_PROGRESS: { variant: 'in-progress', label: 'Em andamento' },
  COMPLETED: { variant: 'completed', label: 'Concluído' },
  CANCELLED: { variant: 'cancelled', label: 'Cancelado' },
};

const checklistMap: Record<ChecklistItemStatus, { variant: 'planned' | 'completed' | 'lost' | 'allocated'; label: string }> = {
  PENDING: { variant: 'planned', label: 'Pendente' },
  CONFIRMED: { variant: 'completed', label: 'Confirmado' },
  MISSING: { variant: 'lost', label: 'Ausente' },
  DAMAGED: { variant: 'allocated', label: 'Avariado' },
};

interface MaterialStatusBadgeProps {
  status: string;
  className?: string;
}

export function MaterialStatusBadge({ status, className }: MaterialStatusBadgeProps) {
  const cfg = materialMap[status as MaterialStatus] ?? { variant: 'planned' as const, label: status };
  return <Badge variant={cfg.variant as any} className={className}>{cfg.label}</Badge>;
}

export function EventStatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = eventMap[status as EventStatus] ?? { variant: 'planned' as const, label: status };
  return <Badge variant={cfg.variant as any} className={className}>{cfg.label}</Badge>;
}

export function ChecklistItemBadge({ status, className }: { status: string; className?: string }) {
  const cfg = checklistMap[status as ChecklistItemStatus] ?? { variant: 'planned' as const, label: status };
  return <Badge variant={cfg.variant as any} className={className}>{cfg.label}</Badge>;
}

interface RoleBadgeProps {
  role?: 'ADMIN' | 'OPERATOR' | string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role === 'ADMIN') return <Badge variant="admin" className={cn(className)}>Admin</Badge>;
  return <Badge variant="operator" className={cn(className)}>Operador</Badge>;
}
