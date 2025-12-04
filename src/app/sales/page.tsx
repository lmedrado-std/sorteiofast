
'use client';

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';

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
import { cn, isCampaignActive as isCampaignStillActive } from '@/lib/utils';
import type { Sale, Coupon } from '@/lib/types';
import AppHeader from '@/components/app/AppHeader';
import CountdownTimer from '@/components/app/CountdownTimer';
import { CalendarIcon, PlusCircle, Search, Ticket, User, VerifiedIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { CAMPAIGN_END_DATE, COUPON_VALUE_THRESHOLD } from '@/lib/config';
import type { CampaignConfig } from '@/app/admin/dashboard/page';
import { useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';


const saleSchema = z.object({
  sellerName: z.string().min(1, 'Nome do vendedor é obrigatório.'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  date: z.date({
    required_error: 'A data da venda é obrigatória.',
  }),
  store: z.string({ required_error: 'A loja é obrigatória.'}),
});

const couponQuerySchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
});

type CouponWithSaleData = Coupon & { sale?: Sale };

export default function SalesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [viewingCpf, setViewingCpf] = useState<string | null>(null);
  const [myCoupons, setMyCoupons] = useState<CouponWithSaleData[]>([]);
  const [isSearchingCoupons, setIsSearchingCoupons] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // Firestore ref and hook for campaign config
  const configDocRef = useMemoFirebase(() => doc(firestore, 'config', 'campaign'), [firestore]);
  const { data: campaignConfigDoc, isLoading: isLoadingConfig } = useDoc<CampaignConfig>(configDocRef);
  
  const [isClient, setIsClient] = useState(false);
  
  const campaignConfig = useMemo(() => {
    if (campaignConfigDoc) {
      return {
        ...campaignConfigDoc,
        campaignEndDate: new Date(campaignConfigDoc.campaignEndDate)
      };
    }
    return {
      couponValueThreshold: COUPON_VALUE_THRESHOLD,
      campaignEndDate: new Date(CAMPAIGN_END_DATE),
    };
  }, [campaignConfigDoc]);

  const isCampaignActive = useMemo(() => isCampaignStillActive(campaignConfig.campaignEndDate), [campaignConfig.campaignEndDate]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saleForm = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sellerName: '',
      cpf: '',
      value: 0,
      date: new Date(),
    },
  });

  const couponQueryForm = useForm<z.infer<typeof couponQuerySchema>>({
    resolver: zodResolver(couponQuerySchema),
    defaultValues: {
      cpf: '',
    }
  });

  const onCouponQuerySubmit = async (data: z.infer<typeof couponQuerySchema>) => {
    setIsSearchingCoupons(true);
    setMyCoupons([]);
    setViewingCpf(data.cpf);

    try {
      const couponsRef = collection(firestore, 'coupons');
      const q = query(couponsRef, where("employeeId", "==", data.cpf));
      const couponSnap = await getDocs(q);
      const employeeCoupons = couponSnap.docs.map(doc => ({ ...doc.data() as Coupon, id: doc.id }));

      if (employeeCoupons.length === 0) {
        setMyCoupons([]);
        toast({
          title: 'Nenhum Cupom Encontrado',
          description: `Não foram encontrados cupons para o CPF informado.`,
        });
        return;
      }
      
      // Batch-fetch related sales
      const saleIds = [...new Set(employeeCoupons.map(c => c.saleId))];
      const salesRef = collection(firestore, 'sales');
      const salesQuery = query(salesRef, where('id', 'in', saleIds));
      const salesSnap = await getDocs(salesQuery);
      const salesData = salesSnap.docs.map(doc => doc.data() as Sale);

      const couponsWithSaleData: CouponWithSaleData[] = employeeCoupons.map(coupon => {
        const sale = salesData.find(s => s.id === coupon.saleId);
        return { ...coupon, sale };
      });
      
      setMyCoupons(couponsWithSaleData);
      toast({
        title: 'Busca Concluída',
        description: `${employeeCoupons.length} cupons encontrados para este CPF.`,
      });
    } catch (error) {
      console.error("Error fetching coupons: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar cupons",
        description: "Houve um problema ao consultar o banco de dados. Tente novamente.",
      });
    } finally {
      setIsSearchingCoupons(false);
    }
  };

  async function onSaleSubmit(data: z.infer<typeof saleSchema>) {
    setIsSubmittingSale(true);
    // 1. Check if campaign is active
    if (!isCampaignActive) {
      toast({
        variant: "destructive",
        title: "Campanha encerrada",
        description: "Não é possível registrar novas vendas.",
      });
      setIsSubmittingSale(false);
      return;
    }

    // 2. Check if value is sufficient
    if (data.value < campaignConfig.couponValueThreshold) {
      toast({
          variant: "destructive",
          title: "Valor Insuficiente",
          description: `O valor da venda deve ser de pelo menos R$ ${campaignConfig.couponValueThreshold.toFixed(2)} para registrar.`,
      });
      setIsSubmittingSale(false);
      return;
    }

    try {
      const saleId = `SALE-${doc(collection(firestore, 'sales')).id}`;
      const sale: Sale = { ...data, id: saleId, employeeId: data.cpf, date: data.date };

      const couponCount = Math.floor(data.value / campaignConfig.couponValueThreshold);
      
      const batch = writeBatch(firestore);
      
      // Add sale
      const saleRef = doc(firestore, "sales", saleId);
      batch.set(saleRef, sale);
      
      // Add coupons
      let newCoupons: CouponWithSaleData[] = [];
      if (couponCount > 0) {
          for (let i = 0; i < couponCount; i++) {
              const couponId = `CUPOM-${doc(collection(firestore, 'coupons')).id.substring(0, 7).toUpperCase()}`;
              const newCoupon: Coupon = {
                  id: couponId,
                  saleId: sale.id,
                  employeeId: data.cpf,
              };
              const couponRef = doc(firestore, "coupons", couponId);
              batch.set(couponRef, newCoupon);
              newCoupons.push({ ...newCoupon, sale });
          }
      }

      await batch.commit();

      // If the user is viewing their own coupons, update the list
      if (viewingCpf === data.cpf) {
        setMyCoupons(prev => [...prev, ...newCoupons]);
      }

      toast({
          title: "Sucesso!",
          description: `Venda registrada e ${couponCount} cupom(s) gerado(s)!`,
          action: <div className="p-2 bg-green-500 rounded-full"><VerifiedIcon className="text-white" /></div>
      });
       // Reset only value and date, keep other fields
      saleForm.reset({
        ...saleForm.getValues(),
        value: 0,
        date: new Date(),
      });
      
    } catch (error) {
      console.error("Error submitting sale:", error);
      toast({
        title: "Erro ao registrar venda",
        description: "Houve um problema ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSale(false);
    }
  }

  if (!isClient || isLoadingConfig) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <User className="h-5 w-5 text-primary" /> Painel do Funcionário
                </CardTitle>
                <CardDescription className="mt-1 text-sm md:text-base">
                  Registre vendas para gerar cupons e consulte seus cupons já gerados nesta campanha.
                </CardDescription>
              </CardHeader>
            </Card>
          
            <CountdownTimer targetDate={campaignConfig.campaignEndDate} />

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="sales" className="flex items-center justify-center gap-1 text-xs md:text-sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda
                </TabsTrigger>
                <TabsTrigger value="coupons" className="flex items-center justify-center gap-1 text-xs md:text-sm">
                  <Ticket className="mr-2 h-4 w-4" /> Meus Cupons
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Venda</CardTitle>
                    <CardDescription>
                      Preencha os dados da venda. Para cada R$ {campaignConfig.couponValueThreshold},00, um cupom será gerado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isCampaignActive ? (
                        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                          <AlertTriangle className="w-12 h-12 text-destructive" />
                          <h3 className="text-xl font-bold">Campanha Encerrada</h3>
                          <p className="text-muted-foreground">O período para registrar novas vendas terminou. Não é mais possível gerar cupons.</p>
                        </div>
                    ) : (
                    <Form {...saleForm}>
                      <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={saleForm.control}
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
                            control={saleForm.control}
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
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={saleForm.control}
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
                            control={saleForm.control}
                            name="value"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor da Venda (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Ex: 1050,75"
                                    {...field}
                                    onBlur={(e) => {
                                      field.onBlur();
                                      const value = parseFloat(e.target.value.replace(',', '.')) || 0;
                                      saleForm.setValue('value', value, { shouldValidate: true });
                                    }}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Allow only numbers and one comma
                                      if (/^[\d,]*$/.test(value) && (value.match(/,/g) || []).length <= 1) {
                                        field.onChange(value);
                                      }
                                    }}
                                    // Display the formatted value
                                    value={
                                        typeof field.value === 'number' && field.value > 0
                                        ? String(field.value).replace('.', ',')
                                        : field.value === 0 ? '' : field.value
                                      }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={saleForm.control}
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
                                      date > new Date(campaignConfig.campaignEndDate) || date < new Date('2024-01-01')
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmittingSale}>
                           {isSubmittingSale ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</> : 'Gerar Cupons'}
                        </Button>
                      </form>
                    </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="coupons">
                <Card>
                  <CardHeader>
                      <CardTitle>Consultar Meus Cupons</CardTitle>
                      <CardDescription>Digite seu CPF para ver todos os cupons que você gerou.</CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...couponQueryForm}>
                      <form onSubmit={couponQueryForm.handleSubmit(onCouponQuerySubmit)} className="flex items-start gap-2">
                        <FormField
                            control={couponQueryForm.control}
                            name="cpf"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                  <Input placeholder="Digite seu CPF (apenas números)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="mt-8" disabled={isSearchingCoupons}>
                            {isSearchingCoupons ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Buscar
                          </Button>
                      </form>
                    </Form>

                    {viewingCpf && !isSearchingCoupons && (
                      <div>
                        <h3 className="mb-4 text-lg font-medium">Cupons para o CPF: <span className="font-bold text-primary">{viewingCpf}</span> ({myCoupons.length})</h3>
                        {myCoupons.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <AnimatePresence>
                              {myCoupons.map((coupon, index) => (
                                <motion.div
                                  key={coupon.id}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.04 }}
                                  className="flex flex-col gap-2 rounded-xl border border-primary/10 bg-card/80 p-3 shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                      <Ticket className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="flex-grow font-mono text-xs md:text-sm font-semibold truncate">
                                      {coupon.id}
                                    </span>
                                  </div>
                                  {coupon.sale && (
                                    <div className="mt-1 flex justify-between gap-2 text-[11px] md:text-xs text-muted-foreground">
                                      <span>
                                        Valor:{' '}
                                        <span className="font-medium text-foreground">
                                          R$ {coupon.sale.value.toFixed(2)}
                                        </span>
                                      </span>
                                      <span>
                                        Data:{' '}
                                        <span className="font-medium text-foreground">
                                          {format(new Date(coupon.sale.date), 'dd/MM/yy', { locale: ptBR })}
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                              </AnimatePresence>
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">Nenhum cupom encontrado para este CPF.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
