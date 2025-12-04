
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Coupon, Sale } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, Trash2, X } from 'lucide-react';
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

interface CouponsListProps {
  allCoupons: Coupon[];
  allSales: Sale[];
  onDeleteCoupon: (couponId: string) => void;
}

export default function CouponsList({ allCoupons, allSales, onDeleteCoupon }: CouponsListProps) {
  
  const getSaleForCoupon = (coupon: Coupon) => {
    return allSales.find(sale => sale.id === coupon.saleId);
  }

  return (
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
                <TableHead className="text-right">Ações</TableHead>
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
                        {sale ? `R$ ${Number(sale.value).toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {sale ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Cupom?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o cupom <span className="font-bold">{coupon.id}</span>? Essa ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteCoupon(coupon.id)} className="bg-destructive hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum cupom gerado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
