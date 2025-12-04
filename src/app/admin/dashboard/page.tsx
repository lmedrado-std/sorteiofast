
'use client';

import { useState, useEffect } from 'react';
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
  if (key === 'supersorteios_sales') {
    return items.map((item: any) => ({ ...item, date: new Date(item.date) }));
  }
  return items;
};

export default function AdminDashboardPage() {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);

  useEffect(() => {
    // In a real app, this data would be fetched from a secure backend.
    setAllCoupons(getFromStorage<Coupon>('supersorteios_coupons'));
    setAllSales(getFromStorage<Sale>('supersorteios_sales'));
  }, []);

  const getSaleForCoupon = (coupon: Coupon) => {
    return allSales.find(sale => sale.id === coupon.saleId);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary flex items-center gap-3">
        <ShieldCheck className="w-8 h-8" />
        Painel do Administrador
      </h1>

      <RaffleSection allCoupons={allCoupons} allSales={allSales} />

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
                  <TableHead>Loja</TableHead>
                  <TableHead>Nome do Vendedor</TableHead>
                  <TableHead className="hidden md:table-cell">CPF</TableHead>
                  <TableHead className="hidden sm:table-cell">Valor da Venda</TableHead>
                  <TableHead className="hidden sm:table-cell">Data da Venda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCoupons.length > 0 ? (
                  allCoupons.map((coupon) => {
                    const sale = getSaleForCoupon(coupon);
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell><Badge variant="outline" className="font-mono text-xs">{coupon.id}</Badge></TableCell>
                        <TableCell>{sale?.store || 'N/A'}</TableCell>
                        <TableCell>{sale ? sale.sellerName : 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-sm">{sale ? sale.cpf : 'N/A'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {sale ? `R$ ${sale.value.toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {sale ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
  );
}

    