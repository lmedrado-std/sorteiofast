'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { conductRaffle } from '@/ai/flows/raffle-management';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper, Trophy } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Coupon, Sale, Winner } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// Helper de formatação de data seguro
function safeFormatDate(raw: any, formatString: string): string {
  if (!raw) return "-";

  let date: Date;

  if (raw instanceof Timestamp) {
    date = raw.toDate();
  } else {
    date = new Date(raw);
  }

  if (isNaN(date.getTime())) return "-";

  return format(date, formatString, { locale: ptBR });
}

const raffleSchema = z.object({
    numberOfWinners: z.coerce.number().int().min(1, 'Pelo menos 1 ganhador é necessário.').positive(),
    store: z.string().optional(),
});

interface RaffleSectionProps {
    allCoupons: Coupon[];
    allSales: Sale[];
    onRaffleConducted: (winners: Winner[]) => void;
}

export default function RaffleSection({ allCoupons, allSales, onRaffleConducted }: RaffleSectionProps) {
    const { toast } = useToast();
    const [lastWinners, setLastWinners] = useState<Winner[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Animation states
    const [isRevealing, setIsRevealing] = useState(false);
    const [displayedInfo, setDisplayedInfo] = useState<{ id: string; name: string } | null>(null);
    const [raffleMessage, setRaffleMessage] = useState("Consultando a sorte...");
    const [isFinalReveal, setIsFinalReveal] = useState(false);

    // Refs for safe animation control
    const rouletteActiveRef = useRef(false);
    const rouletteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const form = useForm<z.infer<typeof raffleSchema>>({
        resolver: zodResolver(raffleSchema),
        defaultValues: {
            numberOfWinners: 1,
            store: "all",
        },
    });

    const onSubmit = async (data: z.infer<typeof raffleSchema>) => {
        let couponsForRaffle: Coupon[];

        if (data.store && data.store !== 'all') {
            const saleIdsForStore = allSales
                .filter(sale => sale.store === data.store)
                .map(sale => sale.id);
            
            couponsForRaffle = allCoupons.filter(coupon => saleIdsForStore.includes(coupon.saleId));
        } else {
            couponsForRaffle = allCoupons;
        }

        if (couponsForRaffle.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Nenhum Cupom',
                description: `Não há cupons disponíveis para a seleção atual.`,
            });
            return;
        }

        if (data.numberOfWinners > couponsForRaffle.length) {
            form.setError('numberOfWinners', {
                type: 'manual',
                message: 'O nº de ganhadores não pode ser maior que o nº de cupons.',
            });
            return;
        }

        const rouletteData = couponsForRaffle.map(coupon => {
            const sale = allSales.find(s => s.id === coupon.saleId);
            return {
                id: coupon.id,
                name: sale?.sellerName || 'Desconhecido',
            };
        });

        setIsLoading(true);
        setLastWinners([]);
        setDisplayedInfo(null);
        setIsFinalReveal(false);

        try {
            // 1. Get the winner from the AI before starting the animation
            const result = await conductRaffle({
                coupons: couponsForRaffle.map(c => c.id),
                numberOfWinners: data.numberOfWinners,
            });

            const winnerDetails: Winner[] = result.winningCoupons.map(couponId => {
                const coupon = allCoupons.find(c => c.id === couponId);
                const sale = coupon ? allSales.find(s => s.id === coupon.saleId) : undefined;
                return {
                    couponId,
                    sellerName: sale ? sale.sellerName : 'Vendedor não encontrado',
                    store: sale ? sale.store : 'Loja não encontrada',
                    date: new Date(),
                    saleValue: sale ? sale.value : 0,
                    saleDate: sale ? sale.date : new Date(),
                };
            });
            
            // 2. Start the visual animation sequence
            setIsRevealing(true);
            setRaffleMessage("Embaralhando os cupons...");
            setTimeout(() => setRaffleMessage("Separando os ganhadores..."), 3000);
            setTimeout(() => setRaffleMessage("Quase lá..."), 7000);
            
            // Decelerating roulette effect (safe version)
            rouletteActiveRef.current = true;
            const runRoulette = (speed: number) => {
                if (!rouletteActiveRef.current) return;

                const randomIndex = Math.floor(Math.random() * rouletteData.length);
                setDisplayedInfo(rouletteData[randomIndex]);

                const nextSpeed = Math.min(speed + 15, 400); // Limit slowdown

                rouletteTimeoutRef.current = setTimeout(() => {
                    runRoulette(nextSpeed);
                }, speed);
            };
            runRoulette(50);

            // 3. Stop roulette after a total of 10 seconds
            setTimeout(() => {
                rouletteActiveRef.current = false;
                if (rouletteTimeoutRef.current) {
                    clearTimeout(rouletteTimeoutRef.current);
                }
                
                // 4. Reveal the true winner with a "pop" animation
                setIsFinalReveal(true);
                setDisplayedInfo({
                    id: winnerDetails[0].couponId,
                    name: winnerDetails[0].sellerName,
                });

                // 5. After a final pause, show the result card
                setTimeout(() => {
                    setIsRevealing(false);
                    setIsFinalReveal(false);
                    setLastWinners(winnerDetails);
                    onRaffleConducted(winnerDetails);
                    toast({
                        title: "Sorteio Realizado!",
                        description: `${winnerDetails.length} ganhador(es) foram selecionados!`,
                    });
                    setIsLoading(false);
                }, 2000);

            }, 10000);

        } catch (error) {
            console.error('Raffle error:', error);
            toast({
                variant: 'destructive',
                title: 'Erro no Sorteio',
                description: 'Ocorreu um erro ao tentar realizar o sorteio. Tente novamente.',
            });
            setIsLoading(false);
            setIsRevealing(false);
        }
    };
    
    const saleIdsWithCoupons = new Set(allCoupons.map(c => c.saleId));
    const salesWithCoupons = allSales.filter(s => saleIdsWithCoupons.has(s.id));
    const availableStores = [...new Set(salesWithCoupons.map(s => s.store))];


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-accent" />
                        Realizar Sorteio
                    </CardTitle>
                    <CardDescription>Use a IA para sortear os ganhadores da campanha de forma aleatória e justa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="store"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Filtrar por Loja</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        disabled={isLoading || isRevealing}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Sortear para todas as lojas" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as Lojas</SelectItem>
                                        {availableStores.map(store => (
                                            <SelectItem key={store} value={store}>{store}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numberOfWinners"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Ganhadores</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="Ex: 3" 
                                                {...field} 
                                                disabled={isLoading || isRevealing}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading || isRevealing || allCoupons.length === 0}>
                                {isLoading || isRevealing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sorteando...
                                    </>
                                ) : (
                                    'Sortear Ganhadores'
                                )}
                            </Button>
                             {allCoupons.length === 0 && <p className="text-xs text-center text-destructive">Nenhum cupom para sortear.</p>}
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PartyPopper className="text-primary" />
                        Últimos Ganhadores
                    </CardTitle>
                    <CardDescription>Os cupons do último sorteio serão exibidos aqui.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isRevealing ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg bg-secondary/30">
                            <span className="text-sm">🎲 {raffleMessage}</span>
                            <div className="my-4 text-2xl sm:text-3xl font-bold h-16 flex items-center justify-center overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={displayedInfo?.id || 'initial'}
                                        initial={{ y: 25, opacity: 0, scale: 0.8 }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                            scale: isFinalReveal ? 1.2 : 1,
                                        }}
                                        transition={{ duration: isFinalReveal ? 0.4 : 0.1, type: "spring" }}
                                        className="text-center"
                                    >
                                        {displayedInfo ? (
                                            <div className="flex flex-col items-center leading-tight">
                                                <span className="text-xl sm:text-2xl font-semibold text-primary">{displayedInfo.name}</span>
                                                <span className="text-sm font-mono text-muted-foreground tracking-widest">{displayedInfo.id}</span>
                                            </div>
                                        ) : (
                                            '...'
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <span className="text-sm">Aguarde...</span>
                        </div>
                    ) : lastWinners.length > 0 ? (
                        <ul className="space-y-3">
                            <AnimatePresence>
                                {lastWinners.map((winner, index) => (
                                    <motion.li
                                        key={winner.couponId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-secondary p-3 rounded-lg"
                                    >
                                        <Trophy className="w-6 h-6 text-amber-500 mt-1 sm:mt-0" />
                                        <div className="flex flex-col flex-1">
                                            <span className="font-semibold">{winner.sellerName}</span>
                                            <span className="text-xs text-muted-foreground">{winner.store}</span>
                                             <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1">
                                                <span>Venda: <span className="font-medium">R$ {winner.saleValue.toFixed(2)}</span></span>
                                                <span>Data: <span className="font-medium">{safeFormatDate(winner.saleDate, 'dd/MM/yyyy')}</span></span>
                                            </div>
                                        </div>
                                        <Badge className="font-mono text-xs w-fit" variant="outline">{winner.couponId}</Badge>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                            <p>Aguardando o sorteio...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
