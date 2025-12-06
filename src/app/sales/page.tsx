
'use client';

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, addDoc } from 'firebase/firestore';

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn, isCampaignActive as isCampaignStillActive } from '@/lib/utils';
import type { Sale, Coupon } from '@/lib/types';
import AppHeader from '@/components/app/AppHeader';
import CountdownTimer from '@/components/app/CountdownTimer';
import { CalendarIcon, PlusCircle, Search, Ticket, User, VerifiedIcon, AlertTriangle, Loader2, Trophy } from 'lucide-react';
import { CAMPAIGN_END_DATE, COUPON_VALUE_THRESHOLD } from '@/lib/config';
import type { CampaignConfig } from '@/app/admin/dashboard/page';
import { db } from '@/firebase';

const saleSchema = z.object({
  sellerName: z.string().min(1, 'Nome do vendedor é obrigatório.'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
  value: z
    .number({ invalid_type_error: "O valor é obrigatório."})
    .positive('O valor deve ser positivo.')
    .max(1000000, 'O valor máximo da venda não pode exceder R$ 1.000.000,00.'),
  date: z.date({
    required_error: 'A data da venda é obrigatória.',
  }),
  store: z.string({ required_error: 'A loja é obrigatória.'}),
});

const couponQuerySchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos.').max(11, 'CPF deve ter 11 dígitos.'),
});

type CouponWithSaleData = Coupon & { sale?: Sale };
type SaleFormData = z.infer<typeof saleSchema>;

const defaultCampaignConfig: CampaignConfig = {
  couponValueThreshold: COUPON_VALUE_THRESHOLD,
  campaignEndDate: new Date(CAMPAIGN_END_DATE),
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function SalesPage() {
  const { toast } = useToast();
  
  const [viewingCpf, setViewingCpf] = useState<string | null>(null);
  const [myCoupons, setMyCoupons] = useState<CouponWithSaleData[]>([]);
  const [isSearchingCoupons, setIsSearchingCoupons] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [sellerRank, setSellerRank] = useState<{ position: number; totalSellers: number; store: string } | null>(null);
  const [valueInput, setValueInput] = useState("");

  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig>(defaultCampaignConfig);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);

  const [confirmationData, setConfirmationData] = useState<SaleFormData | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  
  const isCampaignActive = useMemo(() => isCampaignStillActive(campaignConfig.campaignEndDate), [campaignConfig.campaignEndDate]);

  const summary = useMemo(() => {
    if (!myCoupons || myCoupons.length === 0) {
      return { count: 0, totalValue: 0, sellerName: '' };
    }
    const uniqueSales = new Map<string, Sale>();
    let sellerName = '';
    myCoupons.forEach(coupon => {
      if (coupon.sale && coupon.sale.id) {
        uniqueSales.set(coupon.sale.id, coupon.sale);
        if (!sellerName && coupon.sale.sellerName) {
            sellerName = coupon.sale.sellerName;
        }
      }
    });
    const totalValue = Array.from(uniqueSales.values()).reduce((acc, sale) => {
      return acc + (sale.value || 0);
    }, 0);
    return { count: myCoupons.length, totalValue, sellerName };
  }, [myCoupons]);

  useEffect(() => {
    setIsClient(true);
    
    async function fetchData() {
        try {
            const salesQuery = query(collection(db, 'sales'));
            const couponsQuery = query(collection(db, 'coupons'));
            const configRef = doc(db, 'config', 'campaign');

            const [salesSnap, couponsSnap, configSnap] = await Promise.all([
                getDocs(salesQuery),
                getDocs(couponsQuery),
                getDoc(configRef),
            ]);

            setAllSales(salesSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Sale[]);
            setAllCoupons(couponsSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Coupon[]);

            if (configSnap.exists()) {
                const docData = configSnap.data();
                const rawEndDate = docData.campaignEndDate;
                let endDate = rawEndDate instanceof Timestamp ? rawEndDate.toDate() : new Date(rawEndDate);

                if (isNaN(endDate.getTime())) {
                    endDate = defaultCampaignConfig.campaignEndDate;
                }

                setCampaignConfig({
                    couponValueThreshold: docData.couponValueThreshold || defaultCampaignConfig.couponValueThreshold,
                    campaignEndDate: endDate,
                });
            } else {
                setCampaignConfig(defaultCampaignConfig);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setCampaignConfig(defaultCampaignConfig); // fallback
        } finally {
            setIsLoadingConfig(false);
        }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoadingConfig) {
      console.log(
        "[CONFIG] campaignEndDate:",
        campaignConfig.campaignEndDate.toISOString(),
        "isActive:",
        isCampaignStillActive(campaignConfig.campaignEndDate)
      );
    }
  }, [campaignConfig, isLoadingConfig]);

  const saleForm = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sellerName: '',
      cpf: '',
      value: undefined,
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
    setSellerRank(null);
    setViewingCpf(data.cpf);

    try {
      const couponsRef = collection(db, 'coupons');
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
      
      const saleIds = [...new Set(employeeCoupons.map(c => c.saleId).filter(Boolean))];
      const userSales = allSales.filter(s => s.employeeId === data.cpf);
      const userStore = userSales.length > 0 ? userSales[0].store : null;
      
      const couponsWithSaleData: CouponWithSaleData[] = employeeCoupons.map(coupon => {
        const sale = allSales.find(s => s.id === coupon.saleId);
        return { ...coupon, sale };
      });
      
      setMyCoupons(couponsWithSaleData);

      // Calcular o ranking
      if (userStore) {
        const salesInStore = allSales.filter(s => s.store === userStore);
        const sellerMap: Record<string, { totalSalesValue: number }> = {};

        salesInStore.forEach(sale => {
          if (!sellerMap[sale.employeeId]) {
            sellerMap[sale.employeeId] = { totalSalesValue: 0 };
          }
          sellerMap[sale.employeeId].totalSalesValue += sale.value;
        });

        const rankedSellers = Object.keys(sellerMap)
          .map(cpf => ({ cpf, totalSalesValue: sellerMap[cpf].totalSalesValue }))
          .sort((a, b) => b.totalSalesValue - a.totalSalesValue);
        
        const myRankIndex = rankedSellers.findIndex(seller => seller.cpf === data.cpf);
        
        if (myRankIndex !== -1) {
          setSellerRank({
            position: myRankIndex + 1,
            totalSellers: rankedSellers.length,
            store: userStore,
          });
        }
      }

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

  const handleSaleSubmitRequest = (data: SaleFormData) => {
    setConfirmationData(data);
  };

  async function onSaleSubmit() {
    if (!confirmationData) return;

    setIsSubmittingSale(true);

    if (!isCampaignActive) {
      toast({
        variant: "destructive",
        title: "Campanha encerrada",
        description: "Não é possível registrar novas vendas.",
      });
      setIsSubmittingSale(false);
      setConfirmationData(null);
      return;
    }

    if (confirmationData.value < campaignConfig.couponValueThreshold) {
      toast({
          variant: "destructive",
          title: "Valor Insuficiente",
          description: `O valor da venda deve ser de pelo menos R$ ${campaignConfig.couponValueThreshold.toFixed(2)} para registrar.`,
      });
      setIsSubmittingSale(false);
      setConfirmationData(null);
      return;
    }

    try {
        const salesColRef = collection(db, 'sales');
        const couponsColRef = collection(db, 'coupons');
        
        const saleData: Omit<Sale, 'id'> = { ...confirmationData, employeeId: confirmationData.cpf, date: confirmationData.date, customerName: '' };
        
        const saleRef = await addDoc(salesColRef, saleData);
        const saleId = saleRef.id;
        const finalSale: Sale = { ...saleData, id: saleId };

        setAllSales(prev => [...prev, finalSale]);

        const couponCount = Math.floor(confirmationData.value / campaignConfig.couponValueThreshold);
      
        let newCoupons: CouponWithSaleData[] = [];
        if (couponCount > 0) {
          for (let i = 0; i < couponCount; i++) {
            const newCouponData: Omit<Coupon, 'id'> = {
                saleId: saleId,
                employeeId: confirmationData.cpf,
            };
            const couponRef = await addDoc(couponsColRef, newCouponData);
            const newCouponWithId = { ...newCouponData, id: couponRef.id };
            newCoupons.push({ ...newCouponWithId, sale: finalSale });
            setAllCoupons(prev => [...prev, newCouponWithId]);
          }
        }

      if (viewingCpf === confirmationData.cpf) {
        setMyCoupons(prev => [...prev, ...newCoupons]);
      }

      toast({
          title: "Sucesso!",
          description: `Venda registrada e ${couponCount} cupom(s) gerado(s)!`,
          action: <div className="p-2 bg-green-500 rounded-full"><VerifiedIcon className="text-white" /></div>
      });

      saleForm.reset({
        sellerName: saleForm.getValues("sellerName"),
        cpf: saleForm.getValues("cpf"),
        store: saleForm.getValues("store"),
        value: undefined,
        date: new Date(),
      });
      setValueInput("");
      
    } catch (error) {
      console.error("Error submitting sale:", error);
      toast({
        title: "Erro ao registrar venda",
        description: "Houve um problema ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSale(false);
      setConfirmationData(null);
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
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 md:gap-8">
          
            <CountdownTimer targetDate={campaignConfig.campaignEndDate} />

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-0.5 md:p-1">
                <TabsTrigger value="sales" className="flex items-center justify-center gap-1 py-2 text-[11px] md:text-sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda
                </TabsTrigger>
                <TabsTrigger value="coupons" className="flex items-center justify-center gap-1 py-2 text-[11px] md:text-sm">
                  <Ticket className="mr-2 h-4 w-4" /> Meus Cupons
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sales">
                <Card>
                  <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                    <CardTitle>Nova Venda</CardTitle>
                    <CardDescription>
                      Para cada R$ {campaignConfig.couponValueThreshold.toFixed(2)}, um cupom será gerado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-3 md:px-6 md:pb-6">
                    {!isCampaignActive ? (
                        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                          <AlertTriangle className="w-12 h-12 text-destructive" />
                          <h3 className="text-xl font-bold">Campanha Encerrada</h3>
                          <p className="text-muted-foreground">O período para registrar novas vendas terminou. Não é mais possível gerar cupons.</p>
                        </div>
                    ) : (
                    <Form {...saleForm}>
                      <form onSubmit={saleForm.handleSubmit(handleSaleSubmitRequest)} className="space-y-3 md:space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={saleForm.control}
                            name="sellerName"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5 md:space-y-2">
                                <FormLabel className="text-xs md:text-sm">Nome do Vendedor</FormLabel>
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
                              <FormItem className="space-y-1.5 md:space-y-2">
                                <FormLabel className="text-xs md:text-sm">CPF</FormLabel>
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
                              <FormItem className="space-y-1.5 md:space-y-2">
                                <FormLabel className="text-xs md:text-sm">Loja</FormLabel>
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
                              <FormItem className="space-y-1.5 md:space-y-2">
                                <FormLabel className="text-xs md:text-sm">Valor da Venda (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="R$ 0,00"
                                    value={valueInput}
                                    onChange={(e) => {
                                      const onlyDigits = e.target.value.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setValueInput("");
                                        field.onChange(undefined); // undefined para limpar o campo
                                        return;
                                      }
                                      const numericValue = Number(onlyDigits) / 100;
                                      setValueInput(formatCurrency(numericValue));
                                      field.onChange(numericValue); // Envia o número puro
                                    }}
                                    onBlur={field.onBlur}
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
                            <FormItem className="flex flex-col space-y-1.5 md:space-y-2">
                              <FormLabel className="text-xs md:text-sm">Data da Venda</FormLabel>
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
                                    locale={ptBR}
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
                        <Button type="submit" className="w-full h-9 md:h-10 text-xs md:text-sm bg-accent hover:bg-accent/90" disabled={isSubmittingSale}>
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
                  <CardHeader className="px-4 py-3 md:px-6 md:py-4">
                      <CardTitle>Consultar Meus Cupons</CardTitle>
                      <CardDescription>Digite seu CPF para ver todos os cupons que você gerou.</CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-6 px-4 pb-4 pt-3 md:px-6 md:pb-6">
                    <Form {...couponQueryForm}>
                      <form onSubmit={couponQueryForm.handleSubmit(onCouponQuerySubmit)} className="flex items-start gap-2">
                        <FormField
                            control={couponQueryForm.control}
                            name="cpf"
                            render={({ field }) => (
                              <FormItem className="flex-1 space-y-1.5 md:space-y-2">
                                <FormLabel className="text-xs md:text-sm">CPF</FormLabel>
                                <FormControl>
                                  <Input placeholder="Digite seu CPF (apenas números)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="mt-7 md:mt-8 h-9 md:h-10" disabled={isSearchingCoupons}>
                            {isSearchingCoupons ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Buscar
                          </Button>
                      </form>
                    </Form>

                    {viewingCpf && !isSearchingCoupons && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Resultados para:{' '}
                            <span className="font-bold text-primary">{summary.sellerName || viewingCpf}</span>
                            {summary.sellerName && <span className='text-sm text-muted-foreground font-mono ml-2'>({viewingCpf})</span>}
                        </h3>

                        {myCoupons.length > 0 ? (
                          <div className="space-y-4">
                            <div className="p-3 md:p-4 rounded-lg bg-slate-100/80 border border-slate-200/80 text-xs md:text-sm text-slate-600 space-y-2">
                                <p><strong>{summary.count}</strong> cupom{summary.count > 1 ? 's' : ''} gerado{summary.count > 1 ? 's' : ''}.</p>
                                <p>Valor total em vendas: <span className="font-semibold text-slate-800">R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.</p>
                            </div>
                            
                            {sellerRank && (
                                <Card className="bg-amber-50 border-amber-200">
                                    <CardContent className="p-3 md:p-4 flex items-start gap-3 md:gap-4">
                                        <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mt-1"/>
                                        <div>
                                            <p className="font-semibold text-amber-900 text-sm md:text-base">
                                                Você está em <span className="font-bold">{sellerRank.position}º</span> lugar no ranking de {sellerRank.totalSellers} vendedores da loja.
                                            </p>
                                            <p className="text-xs md:text-sm text-amber-700">{sellerRank.store}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <AnimatePresence>
                                {myCoupons.map((coupon, index) => {
                                  const rawDate = coupon.sale?.date;
                                  let dateValue = null;
                                  if (rawDate) {
                                      if (rawDate instanceof Timestamp) {
                                          dateValue = rawDate.toDate();
                                      } else {
                                          dateValue = new Date(rawDate);
                                      }
                                  }
                                  const isValidDate = dateValue && !isNaN(dateValue.getTime());
                                  
                                  return (
                                    <motion.div 
                                      key={coupon.id}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="flex flex-col gap-2 rounded-2xl border border-pink-200 bg-pink-50/70 p-3 shadow-sm"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500">
                                          <Ticket className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                          <span className="text-[11px] uppercase tracking-wide text-pink-600">Cupom</span>
                                          <span className="font-mono text-xs md:text-sm font-semibold break-all">
                                            {coupon.id}
                                          </span>
                                        </div>
                                        <Badge className="text-[10px]" variant="outline">
                                          #{index + 1}
                                        </Badge>
                                      </div>

                                      {coupon.sale && (
                                        <div className="mt-1 flex justify-between gap-4 text-[11px] md:text-xs text-muted-foreground">
                                          <div className="flex flex-col">
                                            <span>Valor da venda</span>
                                            <span className="font-semibold text-slate-900">
                                              {formatCurrency(coupon.sale.value)}
                                            </span>
                                          </div>
                                          <div className="flex flex-col text-right">
                                            <span>Data</span>
                                            <span className="font-semibold text-slate-900">
                                              {isValidDate ? format(dateValue, "dd/MM/yy", { locale: ptBR }) : "-"}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )
                                })}
                                </AnimatePresence>
                            </div>
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

      <AlertDialog open={!!confirmationData} onOpenChange={(open) => !open && setConfirmationData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Registro de Venda?</AlertDialogTitle>
            {confirmationData && (
                 <AlertDialogDescription asChild>
                    <div>
                        <p>Você confirma o registro da venda com os seguintes dados?</p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground">
                            <li><strong>Vendedor:</strong> {confirmationData.sellerName}</li>
                            <li><strong>CPF:</strong> {confirmationData.cpf}</li>
                            <li><strong>Loja:</strong> {confirmationData.store}</li>
                            <li><strong>Valor:</strong> {formatCurrency(confirmationData.value)}</li>
                            <li><strong>Data:</strong> {format(confirmationData.date, 'dd/MM/yyyy', { locale: ptBR })}</li>
                        </ul>
                    </div>
                 </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingSale}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onSaleSubmit} disabled={isSubmittingSale}>
              {isSubmittingSale ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando...</> : "Confirmar e Gerar Cupons"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
