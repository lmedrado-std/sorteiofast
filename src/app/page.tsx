// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, TicketPercent } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto h-14 flex items-center">
              <div className="flex items-center gap-3 text-foreground">
                <TicketPercent className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold tracking-tight">
                  SuperSorteios
                </span>
              </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Hero */}
          <section className="container mx-auto px-4 pt-16 pb-12 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground">
              Campanha de Vendas SuperSorteios
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Acesse a área do funcionário para registrar suas vendas ou o painel de administrador para gerenciar a campanha.
            </p>
          </section>

          {/* Navigation Cards */}
          <section className="container mx-auto px-4 max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Área do Funcionário */}
              <Link
                href="/sales"
                className="group relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Área do Funcionário
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Registre vendas e consulte seus cupons.
                        </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:translate-x-1 group-hover:scale-110">
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
                <div className="mt-auto pt-6">
                    <p className="text-sm text-foreground">
                      Acesse para registrar vendas e acompanhar seus cupons gerados em tempo real.
                    </p>
                </div>
              </Link>

              {/* Área do Administrador */}
              <Link
                href="/admin"
                className="group relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-primary" />
                            Área do Administrador
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                           Controle completo da campanha.
                        </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:translate-x-1 group-hover:scale-110">
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
                 <div className="mt-auto pt-6">
                    <p className="text-sm text-foreground">
                      Gerencie cupons, configure regras e realize os sorteios de forma segura.
                    </p>
                </div>
              </Link>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="py-6 mt-16">
            <div className="container mx-auto px-4 text-center">
                <p className="text-xs text-muted-foreground">
                    SuperSorteios &copy; {new Date().getFullYear()}
                </p>
            </div>
        </footer>
      </div>
    </main>
  );
}
