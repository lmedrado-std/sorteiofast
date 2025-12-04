
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Winner } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WinnersHistoryProps {
  // The collection data is an array of objects, where each object has a `winners` property
  historyData: { id: string, winners: Winner[] }[];
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
            const raffle = raffleDoc.winners;
            if (!raffle || raffle.length === 0) return null;
            return (
            <AccordionItem value={`item-${index}`} key={raffleDoc.id}>
              <AccordionTrigger>
                Sorteio de {format(new Date(raffle[0].date), 'dd/MM/yyyy \'às\' HH:mm')} - {raffle.length} ganhador(es)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {raffle.map((winner) => (
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
                            <span>Data: <span className="font-medium">{format(new Date(winner.saleDate), 'dd/MM/yyyy', { locale: ptBR })}</span></span>
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
