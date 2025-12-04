
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

import AppHeader from "@/components/app/AppHeader";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
            Campanha de Vendas SuperSorteios
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Registre suas vendas, gere cupons e concorra a prêmios incríveis.
            Transforme seu desempenho em recompensas!
          </p>
        </section>

        <section className="container mx-auto px-4 pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="border-b px-5 py-4 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                    Área do Funcionário
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Registro rápido de vendas e cupons.
                  </p>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-5 space-y-4">
                <p className="text-sm text-muted-foreground flex-grow">
                  Acesse para registrar suas vendas, acompanhar seus cupons gerados
                  e visualizar seu desempenho na campanha.
                </p>
                <Link
                  href="/sales"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-110"
                >
                  Entrar Agora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </article>

            <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="border-b px-5 py-4 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                    Área do Administrador
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Controle total da campanha e sorteios.
                  </p>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-5 space-y-4">
                <p className="text-sm text-muted-foreground flex-grow">
                  Gerencie cupons, defina regras da campanha e realize sorteios de forma segura.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-110"
                >
                  Acessar Painel
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </article>

          </div>
        </section>
      </main>
      <footer className="text-center p-6 text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} SuperSorteios. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
