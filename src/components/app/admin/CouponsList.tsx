'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Coupon, Sale } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, Trash2, User } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Timestamp } from 'firebase/firestore';

interface CouponsListProps {
  allCoupons: Coupon[];
  allSales: Sale[];
  onDeleteCoupon: (couponId: string) => void;
  onDeleteCouponsByEmployee: (employeeId: string, employeeName?: string) => void;
}

// Helper para formatar a data de forma segura, tratando strings, Timestamps e valores inválidos.
function formatSaleDate(raw: any): string {
  if (!raw) return "-";

  let date: Date;
  if (raw instanceof Timestamp) {
    date = raw.toDate();
  } else {
    date = new Date(raw);
  }

  if (isNaN(date.getTime())) return "-";

  return format(date, "dd/MM/yy HH:mm", { locale: ptBR });
}

type CouponWithSale = {
    coupon: Coupon;
    sale?: Sale;
}

type GroupedCoupons = {
    [employeeId: string]: {
        sellerName: string;
        cpf: string;
        items: CouponWithSale[];
    }
}

export default function CouponsList({ allCoupons, allSales, onDeleteCoupon, onDeleteCouponsByEmployee }: CouponsListProps) {
  
  const groupedCoupons = useMemo(() => {
    return allCoupons.reduce((acc, coupon) => {
        const sale = allSales.find(s => s.id === coupon.saleId);
        const employeeId = coupon.employeeId;

        if (!acc[employeeId]) {
            acc[employeeId] = {
                sellerName: sale?.sellerName || 'Vendedor Desconhecido',
                cpf: employeeId,
                items: []
            };
        }

        acc[employeeId].items.push({ coupon, sale });

        // Se encontramos um nome de vendedor melhor, atualizamos
        if (sale?.sellerName && acc[employeeId].sellerName === 'Vendedor Desconhecido') {
          acc[employeeId].sellerName = sale.sellerName;
        }

        return acc;
    }, {} as GroupedCoupons);
  }, [allCoupons, allSales]);

  const sortedEmployeeIds = useMemo(() => {
    return Object.keys(groupedCoupons).sort((a, b) => 
        groupedCoupons[a].sellerName.localeCompare(groupedCoupons[b].sellerName)
    );
  }, [groupedCoupons]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket />
          Todos os Cupons Gerados
        </CardTitle>
        <CardDescription>
          Total de {allCoupons.length} cupons na campanha, agrupados por vendedor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEmployeeIds.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-2">
            {sortedEmployeeIds.map((employeeId) => {
              const group = groupedCoupons[employeeId];
              return (
                <AccordionItem value={employeeId} key={employeeId} className="border rounded-md px-4 bg-secondary/30">
                  <div className="flex items-center w-full">
                    <AccordionTrigger className="hover:no-underline flex-1">
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 text-left'>
                          <User className="w-5 h-5 text-primary"/>
                          <div className='flex flex-col'>
                              <span className='font-semibold'>{group.sellerName}</span>
                              <span className='text-xs text-muted-foreground font-mono'>{group.cpf}</span>
                          </div>
                          <Badge variant="secondary" className="ml-0 sm:ml-2 w-fit">{group.items.length} cupom{group.items.length === 1 ? '' : 's'}</Badge>
                      </div>
                    </AccordionTrigger>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                                <span className="sr-only">Excluir todos os dados de {group.sellerName}</span>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Excluir dados de {group.sellerName}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir todos os <strong>{group.items.length}</strong> cupons e as vendas associadas de {group.sellerName}? Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteCouponsByEmployee(employeeId, group.sellerName)} className="bg-destructive hover:bg-destructive/90">
                                Excluir Tudo
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <AccordionContent>
                    <div className="border-t mt-2 pt-2">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Cupom ID</TableHead>
                            <TableHead>Loja</TableHead>
                            <TableHead>Valor da Venda</TableHead>
                            <TableHead>Data da Venda</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {group.items.map(({ coupon, sale }) => (
                            <TableRow key={coupon.id}>
                                <TableCell><Badge variant="outline" className="font-mono text-xs">{coupon.id}</Badge></TableCell>
                                <TableCell>{sale?.store || 'N/A'}</TableCell>
                                <TableCell>{sale ? `R$ ${Number(sale.value).toFixed(2)}` : 'N/A'}</TableCell>
                                <TableCell>{formatSaleDate(sale?.date)}</TableCell>
                                <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
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
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
            </Accordion>
        ) : (
            <div className="h-24 text-center flex items-center justify-center border-2 border-dashed rounded-md">
                <p className='text-muted-foreground'>Nenhum cupom gerado ainda.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
