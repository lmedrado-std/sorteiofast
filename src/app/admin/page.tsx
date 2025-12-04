'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/app/AppHeader';
import RaffleSection from '@/components/app/RaffleSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Coupon, Sale } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldCheck, Ticket } from 'lucide-react';

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

export default function AdminPage() {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);

  useEffect(() => {
    // In a real app, this data would be fetched from a secure backend.
    // For this demo, we are reading from localStorage.
    setAllCoupons(getFromStorage<Coupon>('supermoda_coupons'));
    setAllSales(getFromStorage<Sale>('supermoda_sales'));
  }, []);

  const getSaleForCoupon = (coupon: Coupon) => {
    return allSales.find(sale => sale.id === coupon.saleId);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" />
            Painel do Administrador
          </h1>

          <RaffleSection allCoupons={allCoupons.map(c => c.id)} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket />
                Todos os Cupons Gerados
              </CardTitle>
              <CardDescription>
                Total de {allCoupons.length} cupons na campanha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cupom ID</TableHead>
                      <TableHead>ID Funcionário</TableHead>
                      <TableHead>Venda Associada</TableHead>
                      <TableHead>Valor da Venda</TableHead>
                      <TableHead>Data da Venda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCoupons.length > 0 ? (
                      allCoupons.map((coupon) => {
                        const sale = getSaleForCoupon(coupon);
                        return (
                          <TableRow key={coupon.id}>
                            <TableCell><Badge variant="outline" className="font-mono">{coupon.id}</Badge></TableCell>
                            <TableCell className="font-mono text-sm">{coupon.employeeId}</TableCell>
                            <TableCell className="font-mono text-sm">{coupon.saleId}</TableCell>
                            <TableCell>
                              {sale ? `R$ ${sale.value.toFixed(2)}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {sale ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum cupom gerado ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
