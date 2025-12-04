
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Ticket, Trash2, History, AlertTriangle } from 'lucide-react';
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
import {
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';


export type CampaignConfig = {
  couponValueThreshold: number;
  campaignEndDate: Date;
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);

  // Firestore Refs
  const couponsColRef = useMemoFirebase(() => collection(firestore, 'coupons'), [firestore]);
  const salesColRef = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
  const winnersHistoryColRef = useMemoFirebase(() => collection(firestore, 'winnersHistory'), [firestore]);
  const configDocRef = useMemoFirebase(() => doc(firestore, 'config', 'campaign'), [firestore]);

  // Firestore Data Hooks
  const { data: allCoupons, isLoading: isLoadingCoupons } = useCollection<Coupon>(couponsColRef);
  const { data: allSales, isLoading: isLoadingSales } = useCollection<Sale>(salesColRef);
  const { data: winnersHistory, isLoading: isLoadingHistory } = useCollection<Winner[]>(winnersHistoryColRef);
  const { data: campaignConfigDoc, isLoading: isLoadingConfig } = useDoc<CampaignConfig>(configDocRef);

  const campaignConfig = useMemo(() => {
    if (campaignConfigDoc) {
      return {
        ...campaignConfigDoc,
        // Ensure date is a Date object
        campaignEndDate: new Date(campaignConfigDoc.campaignEndDate)
      };
    }
    // Provide default values if doc doesn't exist
    return {
      couponValueThreshold: COUPON_VALUE_THRESHOLD,
      campaignEndDate: new Date(CAMPAIGN_END_DATE),
    };
  }, [campaignConfigDoc]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRaffleConducted = (newWinners: Winner[]) => {
    // A "raffle" is a document in the winnersHistory collection
    addDocumentNonBlocking(winnersHistoryColRef, { winners: newWinners, date: new Date() });
  };

  const handleDeleteCoupon = (couponId: string) => {
    const couponDocRef = doc(firestore, 'coupons', couponId);
    deleteDocumentNonBlocking(couponDocRef);
    toast({ title: "Cupom excluído!", description: `O cupom ${couponId} foi removido.` });
  };

  const handleDeleteAllCoupons = async () => {
    if (!allCoupons || allCoupons.length === 0) return;
    
    const batch = writeBatch(firestore);
    allCoupons.forEach(coupon => {
      const couponDocRef = doc(firestore, 'coupons', coupon.id);
      batch.delete(couponDocRef);
    });

    try {
      await batch.commit();
      toast({ title: "Todos os cupons foram excluídos!", variant: "destructive" });
    } catch (error) {
      console.error("Error deleting all coupons: ", error);
      toast({ title: "Erro ao excluir cupons", description: "Ocorreu um erro. Tente novamente.", variant: "destructive" });
    }
  };
  
  const handleDeleteWinnersHistory = async () => {
    if (!winnersHistory || winnersHistory.length === 0) return;

    const batch = writeBatch(firestore);
    winnersHistory.forEach(historyDoc => {
      const historyDocRef = doc(firestore, 'winnersHistory', historyDoc.id);
      batch.delete(historyDocRef);
    });

    try {
      await batch.commit();
      toast({ title: "Histórico de ganhadores foi limpo!", variant: "destructive" });
    } catch (error) {
       console.error("Error clearing winners history: ", error);
       toast({ title: "Erro ao limpar histórico", description: "Ocorreu um erro. Tente novamente.", variant: "destructive" });
    }
  };

  const handleConfigSave = (newConfig: CampaignConfig) => {
    // We use set with merge:true to create or update the document.
    setDocumentNonBlocking(configDocRef, newConfig, { merge: true });
    toast({ title: "Configurações salvas!", description: "As novas configurações da campanha foram aplicadas." });
  }

  const isLoading = isLoadingCoupons || isLoadingSales || isLoadingHistory || isLoadingConfig;

  if (!isClient || isLoading) {
    return <div className="flex justify-center items-center h-full"><p>Carregando dados do Firestore...</p></div>;
  }

  const validCoupons = allCoupons || [];
  const validSales = allSales || [];
  const validHistory = winnersHistory || [];

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
                <Button variant="destructive" size="sm" disabled={validCoupons.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir Todos os Cupons
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle />Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente todos os {validCoupons.length} cupons gerados.
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
                <Button variant="outline" size="sm" disabled={validHistory.length === 0}>
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
        allCoupons={validCoupons} 
        allSales={validSales} 
        onRaffleConducted={handleRaffleConducted}
      />
      
      <WinnersHistory historyData={validHistory} />

      <CouponsList 
        allCoupons={validCoupons} 
        allSales={validSales}
        onDeleteCoupon={handleDeleteCoupon}
      />

    </div>
  );
}
