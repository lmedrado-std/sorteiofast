'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Sale, Coupon } from '@/lib/types';
import AppHeader from '@/components/app/AppHeader';
import CountdownTimer from '@/components/app/CountdownTimer';
import { CalendarIcon, PlusCircle, Ticket, User, VerifiedIcon } from 'lucide-react';

const saleSchema = z.object({
  purchaseNumber: z.string().min(1, 'Número da compra é obrigatório.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  date: z.date({
    required_error: 'A data da venda é obrigatória.',
  }),
});

// Mocking a client-side "database" using localStorage
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  const items = JSON.parse(data);
  if (key === 'supermoda_sales') {
    return items.map((item: any) => ({ ...item, date: new Date(item.date) }));
  }
  return items;
};

const addToStorage = <T>(key: string, newData: T | T[]): void => {
  if (typeof window === 'undefined') return;
  const existingData = getFromStorage<T>(key);
  const dataToAdd = Array.isArray(newData) ? newData : [newData];
  localStorage.setItem(key, JSON.stringify([...existingData, ...dataToAdd]));
};


export default function SalesPage() {
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    let id = localStorage.getItem('supermoda_employeeId');
    if (!id) {
      id = `EMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      localStorage.setItem('supermoda_employeeId', id);
    }
    setEmployeeId(id);

    const allCoupons = getFromStorage<Coupon>('supermoda_coupons');
    setMyCoupons(allCoupons.filter(c => c.employeeId === id));
  }, []);

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      purchaseNumber: '',
      value: 0,
      date: new Date(),
    },
  });

  function onSubmit(data: z.infer<typeof saleSchema>) {
    if (!employeeId) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "ID do funcionário não encontrado. Recarregue a página.",
        });
        return;
    }

    const saleId = `SALE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const sale: Sale = { ...data, id: saleId, employeeId };

    const couponCount = Math.floor(data.value / 250);
    
    if (couponCount > 0) {
        const newCoupons: Coupon[] = Array.from({ length: couponCount }, () => ({
            id: `CUPOM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            saleId: sale.id,
            employeeId,
        }));
        
        addToStorage('supermoda_sales', sale);
        addToStorage('supermoda_coupons', newCoupons);
        setMyCoupons(prev => [...prev, ...newCoupons]);

        toast({
            title: "Sucesso!",
            description: `Venda registrada e ${couponCount} cupom(s) gerado(s)!`,
            action: <div className="p-2 bg-green-500 rounded-full"><VerifiedIcon className="text-white" /></div>
        });
    } else {
        addToStorage('supermoda_sales', sale);
        toast({
            title: "Venda Registrada",
            description: "A venda foi registrada, mas o valor não foi suficiente para gerar um cupom (mínimo R$ 250).",
        });
    }
    form.reset();
  }

  // Set this for the countdown timer. E.g., end of next month.
  const campaignEndDate = new Date();
  campaignEndDate.setMonth(campaignEndDate.getMonth() + 1);
  campaignEndDate.setDate(0); // Last day of current month
  campaignEndDate.setHours(23, 59, 59);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User /> Painel do Funcionário
              </CardTitle>
              <CardDescription>
                Seu ID de funcionário para esta sessão é: <span className="font-bold text-primary">{employeeId}</span>
              </CardDescription>
            </CardHeader>
          </Card>
          
          <CountdownTimer targetDate={campaignEndDate.toISOString()} />

          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sales">
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda
              </TabsTrigger>
              <TabsTrigger value="coupons">
                <Ticket className="mr-2 h-4 w-4" /> Meus Cupons ({myCoupons.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Venda</CardTitle>
                  <CardDescription>
                    Preencha os dados da venda. Para cada R$ 250,00, um cupom será gerado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="purchaseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Compra</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 112233" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Venda (R$)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="Ex: 550.75" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data da Venda</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP', { locale: ptBR })
                                    ) : (
                                      <span>Escolha uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date('2024-01-01')
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                        Gerar Cupons
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <CardTitle>Seus Cupons Gerados</CardTitle>
                  <CardDescription>Aqui estão todos os cupons que você ganhou até agora.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myCoupons.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <AnimatePresence>
                        {myCoupons.map((coupon, index) => (
                           <motion.div
                             key={coupon.id}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: index * 0.05 }}
                             className="bg-secondary/50 p-3 rounded-md flex items-center gap-3 border-l-4 border-primary"
                           >
                             <Ticket className="w-6 h-6 text-accent" />
                             <span className="font-mono text-sm font-semibold">{coupon.id}</span>
                           </motion.div>
                        ))}
                        </AnimatePresence>
                     </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Você ainda não gerou nenhum cupom.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
