'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Medal, TrendingUp } from 'lucide-react';
import type { Coupon, Sale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface SellerRankingProps {
  allSales: Sale[];
  allCoupons: Coupon[];
}

type SellerData = {
  sellerName: string;
  cpf: string;
  totalSalesValue: number;
  couponCount: number;
  store: string;
};

export default function SellerRanking({ allSales, allCoupons }: SellerRankingProps) {
  const rankedSellers = useMemo(() => {
    const sellerMap: Record<string, SellerData> = {};

    // Aggregate data from sales
    allSales.forEach(sale => {
      const { employeeId, sellerName, store, value } = sale;
      if (!sellerMap[employeeId]) {
        sellerMap[employeeId] = {
          cpf: employeeId,
          sellerName: sellerName || 'Vendedor Desconhecido',
          store: store || 'Loja Desconhecida',
          totalSalesValue: 0,
          couponCount: 0,
        };
      }
      sellerMap[employeeId].totalSalesValue += value;
    });

    // Count coupons for each seller
    allCoupons.forEach(coupon => {
      if (sellerMap[coupon.employeeId]) {
        sellerMap[coupon.employeeId].couponCount += 1;
      }
    });

    // Convert map to array and sort by total sales value
    return Object.values(sellerMap).sort((a, b) => b.totalSalesValue - a.totalSalesValue);
  }, [allSales, allCoupons]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-yellow-700" />;
    return <span className="text-sm font-semibold">{rank + 1}</span>;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp />
          Ranking de Vendedores
        </CardTitle>
        <CardDescription>
          Classificação dos vendedores pelo valor total de vendas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rankedSellers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead className="text-right">Total de Vendas (R$)</TableHead>
                <TableHead className="text-right">Cupons Gerados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedSellers.map((seller, index) => (
                <TableRow key={seller.cpf}>
                  <TableCell className="text-center font-medium">
                    <div className="flex justify-center items-center h-full">
                      {getRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{seller.sellerName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{seller.cpf}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{seller.store}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {seller.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{seller.couponCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-24 text-center flex items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Nenhuma venda registrada para gerar o ranking.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
