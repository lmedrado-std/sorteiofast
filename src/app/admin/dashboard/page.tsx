
'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Ticket, Trash2, History, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import RaffleSection from '@/components/app/RaffleSection';
import CouponsList from '@/components/app/admin/CouponsList';
import WinnersHistory from '@/components/app/admin/WinnersHistory';
import type { Coupon, Sale, Winner } from '@/lib/types';
import CampaignSettings from '@/components/app/admin/CampaignSettings';
import { CAMPAIGN_END_DATE, COUPON_VALUE_THRESHOLD } from '@/lib/config';
import { db, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, onSnapshot, Timestamp } from 'firebase/firestore';
import SellerRanking from '@/components/app/admin/SellerRanking';

export type CampaignConfig = {
  couponValueThreshold: number;
  campaignEndDate: Date | Timestamp;
};

type WinnerHistoryDoc = {
  id: string;
  winners: Winner[];
  date: Timestamp;
};

const defaultCampaignConfig = {
  couponValueThreshold: COUPON_VALUE_THRESHOLD,
  campaignEndDate: new Date(CAMPAIGN_END_DATE),
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // State for Firestore data
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<WinnerHistoryDoc[]>([]);
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig>(defaultCampaignConfig);

  // Loading states
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const couponsColRef = collection(db, 'coupons');
    const salesColRef = collection(db, 'sales');
    const winnersHistoryColRef = collection(db, 'winnersHistory');
    const configDocRef = doc(db, 'config', 'campaign');

    const unsubscribeCoupons = onSnapshot(couponsColRef, snapshot => {
      setAllCoupons(snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Coupon[]);
      setIsLoadingCoupons(false);
    });

    const unsubscribeSales = onSnapshot(salesColRef, snapshot => {
      setAllSales(snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Sale[]);
      setIsLoadingSales(false);
    });

    const unsubscribeHistory = onSnapshot(winnersHistoryColRef, snapshot => {
      setWinnersHistory(snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as WinnerHistoryDoc[]);
      setIsLoadingHistory(false);
    });

    const unsubscribeConfig = onSnapshot(configDocRef, docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CampaignConfig;
        let endDate: Date;
        const raw = data.campaignEndDate as any;

        if (raw instanceof Timestamp) {
          endDate = raw.toDate();
        } else {
          // Handles string or Date objects
          endDate = new Date(raw);
        }

        setCampaignConfig({
          ...data,
          campaignEndDate: endDate,
        });
      } else {
        setCampaignConfig(defaultCampaignConfig);
      }
      setIsLoadingConfig(false);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCoupons();
      unsubscribeSales();
      unsubscribeHistory();
      unsubscribeConfig();
    };
  }, []);

  const handleRaffleConducted = (newWinners: Winner[]) => {
    const winnersHistoryColRef = collection(db, 'winnersHistory');
    addDocumentNonBlocking(winnersHistoryColRef, { winners: newWinners, date: new Date() });
  };

  const handleDeleteCoupon = (couponId: string) => {
    const couponDocRef = doc(db, 'coupons', couponId);
    deleteDocumentNonBlocking(couponDocRef);
    toast({ title: "Cupom excluído!", description: `O cupom ${couponId} foi removido.` });
  };
  
  const handleDeleteCouponsByEmployee = async (employeeId: string, employeeName?: string) => {
    const couponsToDelete = allCoupons.filter(c => c.employeeId === employeeId);
    const salesToDelete = allSales.filter(s => s.employeeId === employeeId);

    if (couponsToDelete.length === 0 && salesToDelete.length === 0) {
      toast({
        title: "Nenhum dado para excluir",
        description: `Não foram encontrados cupons ou vendas para ${employeeName || 'vendedor selecionado'}.`
      });
      return;
    }

    const batch = writeBatch(db);

    couponsToDelete.forEach(coupon => {
      batch.delete(doc(db, 'coupons', coupon.id));
    });

    salesToDelete.forEach(sale => {
        batch.delete(doc(db, 'sales', sale.id));
    });

    await batch.commit();

    toast({ 
      title: "Dados do vendedor excluídos!",
      description: `Todos os cupons e vendas de ${employeeName || 'vendedor selecionado'} foram removidos.`,
      variant: "destructive"
    });
  };

  const handleDeleteAllCoupons = async () => {
    if (allCoupons.length === 0) return;
    const batch = writeBatch(db);
    allCoupons.forEach(coupon => {
      batch.delete(doc(db, 'coupons', coupon.id));
    });
    await batch.commit();
    toast({ title: "Todos os cupons foram excluídos!", variant: "destructive" });
  };
  
  const handleDeleteWinnersHistory = async () => {
    if (winnersHistory.length === 0) return;
    const batch = writeBatch(db);
    winnersHistory.forEach(historyDoc => {
      batch.delete(doc(db, 'winnersHistory', historyDoc.id));
    });
    await batch.commit();
    toast({ title: "Histórico de ganhadores foi limpo!", variant: "destructive" });
  };

  const handleConfigSave = (newConfig: Omit<CampaignConfig, 'campaignEndDate'> & { campaignEndDate: Date }) => {
    const configDocRef = doc(db, 'config', 'campaign');
    setDocumentNonBlocking(configDocRef, newConfig, { merge: true });
    toast({ title: "Configurações salvas!" });
  }

  const isLoading = isLoadingCoupons || isLoadingSales || isLoadingHistory || isLoadingConfig;

  if (!isClient || isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando dados do painel...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          Painel do Administrador
        </h1>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={allCoupons.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir Todos os Cupons
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle />Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente todos os {allCoupons.length} cupons gerados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllCoupons} className="bg-destructive hover:bg-destructive/90">
                    Sim, excluir tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
               <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={winnersHistory.length === 0}>
                  <History className="mr-2 h-4 w-4" /> Limpar Histórico
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                   <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle />Tem certeza?</AlertDialogTitle>
                   <AlertDialogDescription>
                    Essa ação limpará todo o histórico de sorteios. Os cupons não serão afetados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteWinnersHistory}>
                    Sim, limpar histórico
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      
      <CampaignSettings currentConfig={campaignConfig} onSave={handleConfigSave} />

      <RaffleSection 
        allCoupons={allCoupons} 
        allSales={allSales} 
        onRaffleConducted={handleRaffleConducted}
      />

      <SellerRanking allSales={allSales} allCoupons={allCoupons} />
      
      <WinnersHistory historyData={winnersHistory} />

      <CouponsList 
        allCoupons={allCoupons} 
        allSales={allSales}
        onDeleteCoupon={handleDeleteCoupon}
        onDeleteCouponsByEmployee={handleDeleteCouponsByEmployee}
      />

    </div>
  );
}
