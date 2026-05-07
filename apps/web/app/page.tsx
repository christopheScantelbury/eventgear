import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-primary mb-2">EventGear</h1>
        <p className="text-gray-500 mb-8">Controle de Equipamentos de Eventos</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Entrar
        </Link>
      </div>
      <p className="mt-12 text-xs text-gray-400">ScantelburyDevs · Build · Migrate · Innovate</p>
    </main>
  );
}
