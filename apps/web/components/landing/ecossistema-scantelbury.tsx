import Link from 'next/link';

// ── Ecossistema ScantelburyDevs ─────────────────────────────────────────────
// Card destacado = EventGear (produto atual). Outros cards levam para os
// produtos irmãos. Reutilize em qualquer landing antes do footer.

type Produto = {
  nome: string;
  subtitulo: string;
  href: string | null; // null = "você está aqui"
  cor: string;         // classe Tailwind para o pontinho colorido
};

const PRODUTOS: Produto[] = [
  {
    nome: 'Nota Fácil',
    subtitulo: 'Emissão de NFS-e Nacional',
    href: 'https://emitirnotafacil.com.br',
    cor: 'bg-cyan-400',
  },
  {
    nome: 'EventGear',
    subtitulo: 'Gestão de equipamentos para eventos',
    href: null, // produto atual
    cor: 'bg-amber-400',
  },
  {
    nome: 'Agenda Inteligente',
    subtitulo: 'Agendamentos com IA',
    href: 'https://agendainteligentefrontend.agendainteligenteapp.cloud',
    cor: 'bg-violet-400',
  },
];

export function EcossistemaScantelbury() {
  return (
    <section className="py-16 px-4 sm:px-6 border-y border-gray-100">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Ecossistema
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Integrado ao ecossistema <span className="text-amber-500">ScantelburyDevs</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRODUTOS.map((p) => {
            const isCurrent = p.href === null;

            const card = (
              <div
                className={[
                  'rounded-xl border p-5 text-left transition-all',
                  isCurrent
                    ? 'border-amber-300 bg-amber-50 cursor-default shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${p.cor}`} aria-hidden="true" />
                    <span className={`font-semibold text-sm ${isCurrent ? 'text-amber-700' : 'text-gray-900'}`}>
                      {p.nome}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      Você está aqui
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{p.subtitulo}</p>
              </div>
            );

            if (isCurrent) return <div key={p.nome}>{card}</div>;

            return (
              <Link
                key={p.nome}
                href={p.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
              >
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
