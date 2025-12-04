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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CalendarIcon, LogIn, PlusCircle, Ticket, User, VerifiedIcon } from 'lucide-react';
import { getFromStorage, addToStorage } from '@/lib/storage';


const saleSchema = z.object({
  sellerName: z.string().min(1, 'Nome do vendedor é obrigatório.'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  date: z.date({
    required_error: 'A data da venda é obrigatória.',
  }),
  store: z.string({ required_error: 'A loja é obrigatória.'}),
});

const loginSchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
});


export default function SalesPage() {
  const { toast } = useToast();
  const [loggedInCpf, setLoggedInCpf] = useState<string | null>(null);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const cpf = sessionStorage.getItem('loggedInCpf');
    if (cpf) {
      handleLoginSuccess(cpf);
    }
  }, []);

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sellerName: '',
      cpf: '',
      value: 0,
      date: new Date(),
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: '',
    }
  });

  const handleLoginSuccess = (cpf: string) => {
    setLoggedInCpf(cpf);
    sessionStorage.setItem('loggedInCpf', cpf);

    const allSales = getFromStorage<Sale>('supersorteios_sales');
    const employeeSales = allSales.filter(sale => sale.cpf === cpf);
    const saleIds = employeeSales.map(sale => sale.id);

    const allCoupons = getFromStorage<Coupon>('supersorteios_coupons');
    const employeeCoupons = allCoupons.filter(coupon => saleIds.includes(coupon.saleId));
    
    setMyCoupons(employeeCoupons);

    // Pre-fill the form
    const latestSale = employeeSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    form.reset({
      sellerName: latestSale?.sellerName || '',
      cpf: cpf,
      value: 0,
      date: new Date(),
    });
  };

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    handleLoginSuccess(data.cpf);
    toast({
      title: 'Login efetuado!',
      description: 'Bem-vindo(a) de volta!',
    });
  };

  function onSubmit(data: z.infer<typeof saleSchema>) {
    if (!loggedInCpf) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "CPF do vendedor não encontrado. Faça login novamente.",
        });
        return;
    }

    const saleId = `SALE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const sale: Sale = { ...data, id: saleId, employeeId: loggedInCpf }; // Using CPF as employeeId for simplicity

    const couponCount = Math.floor(data.value / 1000);
    
    if (couponCount > 0) {
        const newCoupons: Coupon[] = Array.from({ length: couponCount }, () => ({
            id: `CUPOM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            saleId: sale.id,
            employeeId: loggedInCpf, // Using CPF as employeeId for simplicity
        }));
        
        addToStorage('supersorteios_sales', sale);
        addToStorage('supersorteios_coupons', newCoupons);
        setMyCoupons(prev => [...prev, ...newCoupons]);

        toast({
            title: "Sucesso!",
            description: `Venda registrada e ${couponCount} cupom(s) gerado(s)!`,
            action: <div className="p-2 bg-green-500 rounded-full"><VerifiedIcon className="text-white" /></div>
        });
    } else {
        addToStorage('supersorteios_sales', sale);
        toast({
            title: "Venda Registrada",
            description: "A venda foi registrada, mas o valor não foi suficiente para gerar um cupom (mínimo R$ 1000).",
        });
    }
    
    // Reset only value and date
    form.reset({
      ...form.getValues(),
      value: 0,
      date: new Date(),
    });
  }

  // Set this for the countdown timer. E.g., end of next month.
  const campaignEndDate = new Date();
  campaignEndDate.setMonth(campaignEndDate.getMonth() + 1);
  campaignEndDate.setDate(0); // Last day of current month
  campaignEndDate.setHours(23, 59, 59);


  if (!loggedInCpf) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-6 h-6" />
                Acesso do Funcionário
              </CardTitle>
              <CardDescription>
                Por favor, insira seu CPF para registrar vendas e ver seus cupons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu CPF (apenas números)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2" />
                    Entrar
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
                Bem-vindo(a)! CPF logado: <span className="font-bold text-primary">{loggedInCpf}</span>
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
                    Preencha os dados da venda. Para cada R$ 1.000,00, um cupom será gerado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="sellerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Vendedor</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: João da Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 12345678900" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="store"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loja</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a loja" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Supermoda Dias D'Ávila">Supermoda Dias D'Ávila</SelectItem>
                                <SelectItem value="Supermoda Catu">Supermoda Catu</SelectItem>
                              </SelectContent>
                            </Select>
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
                              <Input type="number" step="0.01" placeholder="Ex: 1050.75" {...field} />
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
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
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
