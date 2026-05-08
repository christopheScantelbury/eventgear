import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    return data?.message ?? data?.detail ?? data?.error ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export const STATUS_LABELS = {
  PLANNED: 'Planejado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
} as const;

export const MATERIAL_STATUS_LABELS = {
  AVAILABLE: 'Disponível',
  ALLOCATED: 'Alocado',
  MAINTENANCE: 'Manutenção',
  LOST: 'Extraviado',
} as const;
