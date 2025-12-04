import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, TicketPercent } from "lucide-react";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import AppHeader from "@/components/app/AppHeader";

export default function Home() {
  const employeeImage = PlaceHolderImages.find(p => p.id === 'employee-area');
  const adminImage = PlaceHolderImages.find(p => p.id === 'admin-area');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
            Campanha de Vendas SuperSorteios
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Registre suas vendas, gere cupons e concorra a prêmios incríveis.
            Transforme seu desempenho em recompensas!
          </p>
        </section>

        <section className="container mx-auto px-4 pb-12 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
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

              {employeeImage && (
                <div className="px-5 pt-5">
                    <div className="relative overflow-hidden rounded-xl">
                    <Image
                        src={employeeImage.imageUrl}
                        alt={employeeImage.description}
                        data-ai-hint={employeeImage.imageHint}
                        width={600}
                        height={400}
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    </div>
                </div>
              )}

              <div className="flex flex-col flex-grow px-5 pb-5 pt-4 space-y-4">
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

              {adminImage && (
                <div className="px-5 pt-5">
                    <div className="relative overflow-hidden rounded-xl">
                    <Image
                        src={adminImage.imageUrl}
                        alt={adminImage.description}
                        data-ai-hint={adminImage.imageHint}
                        width={600}
                        height={400}
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    </div>
                </div>
              )}

              <div className="flex flex-col flex-grow px-5 pb-5 pt-4 space-y-4">
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
