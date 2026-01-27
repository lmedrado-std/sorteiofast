import { TicketPercent } from "lucide-react";
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <TicketPercent className="w-8 h-8" />
          <span className="text-xl font-bold font-headline tracking-tight">
            SuperSorteios
          </span>
        </Link>
      </div>
    </header>
  );
}
