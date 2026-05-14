import { redirect } from 'next/navigation';

// Página de planos/billing removida — redireciona para o dashboard.
export default function PlanosPage() {
  redirect('/dashboard');
}
