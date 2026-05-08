import { type LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  labelBotao?: string;
  onBotao?: () => void;
}

export function EmptyState({ icone: Icon, titulo, descricao, labelBotao, onBotao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-dark-800 border border-dark-border rounded-xl">
      <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-muted opacity-60" />
      </div>
      <h3 className="font-display font-bold text-lg tracking-wide text-text-secondary mb-1">
        {titulo}
      </h3>
      {descricao && (
        <p className="text-sm text-text-muted max-w-xs mb-5">{descricao}</p>
      )}
      {labelBotao && onBotao && (
        <Button onClick={onBotao} size="sm">
          {labelBotao}
        </Button>
      )}
    </div>
  );
}
