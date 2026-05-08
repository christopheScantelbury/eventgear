'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    // Simula envio — integrar com API quando disponível
    await new Promise((r) => setTimeout(r, 800));
    setSentEmail(data.email);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-status-available/12 border border-status-available/25 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-status-available" />
        </div>
        <h2 className="font-display text-xl font-bold tracking-wide text-text-primary mb-2">
          E-mail enviado!
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Enviamos as instruções de recuperação para{' '}
          <span className="font-medium text-text-primary">{sentEmail}</span>.
          Verifique sua caixa de entrada.
        </p>
        <Link href="/login">
          <Button variant="ghost" block>
            <ChevronLeft size={16} />
            Voltar para o login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="w-14 h-14 bg-amber-500/12 border border-amber-500/25 rounded-full flex items-center justify-center mx-auto mb-5">
        <Lock size={24} className="text-amber-400" />
      </div>

      <h2 className="font-display text-xl font-bold tracking-wide text-text-primary mb-1 text-center">
        Recuperar senha
      </h2>
      <p className="text-sm text-text-secondary mb-6 text-center">
        Digite seu e-mail e enviaremos as instruções de recuperação.
      </p>

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
          />
          {errors.email && (
            <p className="mt-1 text-xs text-status-lost">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} block size="md">
          {isSubmitting && <Spinner className="w-4 h-4 text-dark-900" />}
          Enviar instruções
        </Button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Voltar para o login
        </Link>
      </div>
    </>
  );
}
