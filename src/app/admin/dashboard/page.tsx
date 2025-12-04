
'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Ticket, Trash2, History, X, AlertTriangle } from 'lucide-react';
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
import { getFromStorage, saveToStorage, clearFromStorage, getObjectFromStorage, saveObjectToStorage } from '@/lib/storage';
import CampaignSettings from '@/components/app/admin/CampaignSettings';
import { CAMPAIGN_END_DATE, COUPON_VALUE_THRESHOLD } from '@/lib/config';

export type CampaignConfig = {
  couponValueThreshold: number;
  campaignEndDate: string;
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<Winner[][]>([]);
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig>({
    couponValueThreshold: COUPON_VALUE_THRESHOLD,
    campaignEndDate: CAMPAIGN_END_DATE,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setAllCoupons(getFromStorage<Coupon>('supersorteios_coupons'));
    setAllSales(getFromStorage<Sale>('supersorteios_sales'));
    setWinnersHistory(getFromStorage<Winner[]>('supersorteios_winners_history'));
    const savedConfig = getObjectFromStorage<CampaignConfig>('supersorteios_config');
    if (savedConfig) {
      setCampaignConfig(savedConfig);
    }
  }, []);

  const handleRaffleConducted = (newWinners: Winner[]) => {
    const newHistory = [...winnersHistory, newWinners];
    setWinnersHistory(newHistory);
    saveToStorage('supersorteios_winners_history', newHistory);
  };

  const handleDeleteCoupon = (couponId: string) => {
    const updatedCoupons = allCoupons.filter(c => c.id !== couponId);
    setAllCoupons(updatedCoupons);
    saveToStorage('supersorteios_coupons', updatedCoupons);
    toast({ title: "Cupom excluído!", description: `O cupom ${couponId} foi removido.` });
  };

  const handleDeleteAllCoupons = () => {
    setAllCoupons([]);
    clearFromStorage('supersorteios_coupons');
    toast({ title: "Todos os cupons foram excluídos!", variant: "destructive" });
  };
  
  const handleDeleteWinnersHistory = () => {
    setWinnersHistory([]);
    clearFromStorage('supersorteios_winners_history');
    toast({ title: "Histórico de ganhadores foi limpo!", variant: "destructive" });
  };

  const handleConfigSave = (newConfig: CampaignConfig) => {
    setCampaignConfig(newConfig);
    saveObjectToStorage('supersorteios_config', newConfig);
    toast({ title: "Configurações salvas!", description: "As novas configurações da campanha foram aplicadas." });
  }


  if (!isClient) {
    return <div className="flex justify-center items-center h-full"><p>Carregando...</p></div>;
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
      
      <WinnersHistory history={winnersHistory} />

      <CouponsList 
        allCoupons={allCoupons} 
        allSales={allSales}
        onDeleteCoupon={handleDeleteCoupon}
      />

    </div>
  );
}
