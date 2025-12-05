'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Winner } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';

// Tipagem correta para o documento de histórico, incluindo a data do sorteio
type WinnerHistoryDoc = {
  id: string;
  winners: Winner[];
  date: Timestamp; // A data em que o sorteio foi realizado
};

interface WinnersHistoryProps {
  historyData: WinnerHistoryDoc[];
}

// Helper de formatação de data seguro
function safeFormatDate(raw: any, formatString: string): string {
  if (!raw) return "Data inválida";

  let date: Date;
  if (raw instanceof Timestamp) {
    date = raw.toDate();
  } else {
    date = new Date(raw);
  }

  if (isNaN(date.getTime())) return "Data inválida";
  
  return format(date, formatString, { locale: ptBR });
}

export default function WinnersHistory({ historyData }: WinnersHistoryProps) {
  if (!historyData || historyData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History />
                    Histórico de Ganhadores
                </CardTitle>
                <CardDescription>Nenhum sorteio foi realizado ainda.</CardDescription>
            </CardHeader>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History />
          Histórico de Ganhadores
        </CardTitle>
        <CardDescription>
          Veja os resultados de todos os sorteios realizados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {historyData.map((raffleDoc, index) => {
            if (!raffleDoc.winners || raffleDoc.winners.length === 0) return null;
            return (
            <AccordionItem value={`item-${index}`} key={raffleDoc.id}>
              <AccordionTrigger>
                {/* Usa a data do documento do sorteio e formata com segurança */}
                Sorteio de {safeFormatDate(raffleDoc.date, "dd/MM/yyyy 'às' HH:mm")} - {raffleDoc.winners.length} ganhador(es)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {raffleDoc.winners.map((winner) => (
                    <li
                      key={winner.couponId}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-secondary/50 p-3 rounded-lg"
                    >
                      <Trophy className="w-6 h-6 text-amber-500 mt-1 sm:mt-0" />
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold">{winner.sellerName}</span>
                        <span className="text-xs text-muted-foreground">{winner.store}</span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1">
                            <span>Venda: <span className="font-medium">R$ {Number(winner.saleValue).toFixed(2)}</span></span>
                            {/* Usa a data da venda do ganhador e formata com segurança */}
                            <span>Data: <span className="font-medium">{safeFormatDate(winner.saleDate, 'dd/MM/yyyy')}</span></span>
                        </div>
                      </div>
                      <Badge className="font-mono text-xs" variant="outline">{winner.couponId}</Badge>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      </CardContent>
    </Card>
  );
}
