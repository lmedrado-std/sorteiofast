// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-8 md:py-14">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            SuperSorteios
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-rose-700">
            Campanha de Vendas SuperSorteios
          </h1>
          <p className="mt-4 text-sm md:text-base text-slate-600">
            Registre suas vendas, gere cupons e concorra a prêmios incríveis.
            Acompanhe o desempenho da equipe e transforme resultados em recompensas.
          </p>
        </section>

        {/* Cards de navegação */}
        <section className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Área do Funcionário */}
            <Link
              href="/sales"
              className="group flex flex-col rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Área do Funcionário
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Registro rápido de vendas e cupons.
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm text-slate-600">
                Acesse para registrar suas vendas, acompanhar os cupons gerados
                e visualizar seu desempenho na campanha em tempo real.
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs md:text-sm font-medium text-rose-600">
                  Entrar Agora
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white transition group-hover:translate-x-1 group-hover:bg-rose-700">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Área do Administrador */}
            <Link
              href="/admin"
              className="group flex flex-col rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Área do Administrador
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Controle completo da campanha.
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm text-slate-600">
                Gerencie cupons, configure regras, acompanhe resultados por loja
                e realize os sorteios de forma segura e transparente.
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs md:text-sm font-medium text-rose-600">
                  Acessar Painel
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white transition group-hover:translate-x-1 group-hover:bg-rose-700">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>

          {/* Call-to-action secundário / ajuda */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs md:text-sm text-slate-500">
            <p>
              Dúvidas sobre como participar? Entre na área do administrador para
              ver o regulamento completo da campanha.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}