'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, setTokens } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await authApi.login(data);
      setTokens(res.accessToken, res.refreshToken);
      const me = await authApi.me();
      setAuth(
        { id: me.id, name: me.name, email: me.email, role: me.role, companyId: me.companyId },
        res.accessToken,
        res.refreshToken,
      );
      const from = params.get('from') ?? '/dashboard';
      router.replace(from);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <>
      <h2 className="font-display text-xl font-bold tracking-wide text-text-primary mb-1">
        Entrar na sua conta
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Acesso restrito a operadores autorizados.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-status-lost/30 border-l-[3px] border-l-status-lost bg-status-lost/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            state={errors.email ? 'error' : 'default'}
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-status-lost">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            state={errors.password ? 'error' : 'default'}
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-status-lost">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} block size="md">
          {isSubmitting && <Spinner className="w-4 h-4 text-dark-900" />}
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Não tem conta?{' '}
        <Link href="/register" className="text-amber-400 font-medium hover:text-amber-300">
          Criar empresa
        </Link>
      </p>
    </>
  );
}
