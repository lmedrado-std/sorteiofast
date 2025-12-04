
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Winner } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WinnersHistoryProps {
  history: Winner[][];
}

export default function WinnersHistory({ history }: WinnersHistoryProps) {
  if (!history || history.length === 0) {
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
          {history.map((raffle, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                Sorteio de {format(new Date(raffle[0].date), 'dd/MM/yyyy \'às\' HH:mm')} - {raffle.length} ganhador(es)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {raffle.map((winner) => (
                    <li
                      key={winner.couponId}
                      className="flex flex-wrap items-center gap-3 bg-secondary/50 p-3 rounded-lg"
                    >
                      <Trophy className="w-6 h-6 text-amber-500" />
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold">{winner.sellerName}</span>
                        <span className="text-xs text-muted-foreground">{winner.store}</span>
                      </div>
                      <Badge className="font-mono text-xs" variant="outline">{winner.couponId}</Badge>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
