import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">
            Campanha de Vendas SuperSorteios
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Registre suas vendas, gere cupons e concorra a prêmios incríveis.
            Participe agora e transforme seu desempenho em recompensas!
          </p>
        </section>

        <section className="container mx-auto px-4 pb-12 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline text-2xl">Área do Funcionário</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-4">
                 {employeeImage && (
                  <div className="w-full h-48 relative rounded-md overflow-hidden">
                     <Image
                      src={employeeImage.imageUrl}
                      alt={employeeImage.description}
                      data-ai-hint={employeeImage.imageHint}
                      fill
                      className="object-cover"
                    />
                  </div>
                 )}
                <p className="text-foreground/80 flex-grow">
                  Acesse para registrar suas vendas, acompanhar seus cupons e ver sua performance na campanha.
                </p>
                <Button asChild className="mt-auto w-full" variant="secondary">
                  <Link href="/sales">
                    Entrar Agora <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline text-2xl">Área do Administrador</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-4">
                {adminImage && (
                    <div className="w-full h-48 relative rounded-md overflow-hidden">
                      <Image
                        src={adminImage.imageUrl}
                        alt={adminImage.description}
                        data-ai-hint={adminImage.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                <p className="text-foreground/80 flex-grow">
                  Gerencie os cupons, visualize os dados da campanha e realize o sorteio dos prêmios.
                </p>
                <Button asChild className="mt-auto w-full" variant="secondary">
                  <Link href="/admin">
                    Acessar Painel <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="text-center p-4 text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} SuperSorteios. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
