'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await authApi.login(data);
      // Busca dados do usuário autenticado
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Spinner className="w-4 h-4" />}
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Criar empresa
        </Link>
      </p>
    </>
  );
}
