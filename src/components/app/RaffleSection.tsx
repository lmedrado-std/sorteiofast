'use client';

import { useState } from 'react';
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
import type { Coupon, Sale } from '@/lib/types';

const raffleSchema = z.object({
    numberOfWinners: z.coerce.number().int().min(1, 'Pelo menos 1 ganhador é necessário.').positive(),
});

interface RaffleSectionProps {
    allCoupons: Coupon[];
    allSales: Sale[];
}

interface Winner {
    couponId: string;
    sellerName: string;
}

export default function RaffleSection({ allCoupons, allSales }: RaffleSectionProps) {
    const { toast } = useToast();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof raffleSchema>>({
        resolver: zodResolver(raffleSchema),
        defaultValues: {
            numberOfWinners: 1,
        },
    });

    const onSubmit = async (data: z.infer<typeof raffleSchema>) => {
        if (data.numberOfWinners > allCoupons.length) {
            form.setError('numberOfWinners', {
                type: 'manual',
                message: 'O número de ganhadores não pode ser maior que o número de cupons.',
            });
            return;
        }

        setIsLoading(true);
        setWinners([]);

        try {
            const result = await conductRaffle({
                coupons: allCoupons.map(c => c.id),
                numberOfWinners: data.numberOfWinners,
            });

            const winnerDetails: Winner[] = result.winningCoupons.map(couponId => {
                const coupon = allCoupons.find(c => c.id === couponId);
                const sale = coupon ? allSales.find(s => s.id === coupon.saleId) : undefined;
                return {
                    couponId,
                    sellerName: sale ? sale.sellerName : 'Vendedor não encontrado'
                };
            });
            
            setWinners(winnerDetails);

            toast({
                title: "Sorteio Realizado!",
                description: `${winnerDetails.length} ganhador(es) foram selecionados!`,
            });
        } catch (error) {
            console.error('Raffle error:', error);
            toast({
                variant: 'destructive',
                title: 'Erro no Sorteio',
                description: 'Ocorreu um erro ao tentar realizar o sorteio. Tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                                name="numberOfWinners"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Ganhadores</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading || allCoupons.length === 0}>
                                {isLoading ? (
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
                        Ganhadores
                    </CardTitle>
                    <CardDescription>Os cupons sorteados serão exibidos aqui.</CardDescription>
                </CardHeader>
                <CardContent>
                    {winners.length > 0 ? (
                        <ul className="space-y-3">
                            <AnimatePresence>
                                {winners.map((winner, index) => (
                                    <motion.li
                                        key={winner.couponId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-wrap items-center gap-3 bg-secondary p-3 rounded-lg"
                                    >
                                        <Trophy className="w-6 h-6 text-amber-500" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{winner.sellerName}</span>
                                            <Badge className="font-mono text-xs w-fit" variant="outline">{winner.couponId}</Badge>
                                        </div>
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
