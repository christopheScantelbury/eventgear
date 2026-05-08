export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">EventGear</h1>
        <p className="text-sm text-gray-500 mt-1">Controle de Equipamentos de Eventos</p>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {children}
      </div>
      <p className="mt-6 text-xs text-gray-400">ScantelburyDevs · Build · Migrate · Innovate</p>
    </div>
  );
}
