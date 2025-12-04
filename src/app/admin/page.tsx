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
import { ShieldCheck, Ticket, KeyRound, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = "admin"; // Senha para acesso ao painel

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

export default function AdminPage() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);

  useEffect(() => {
    // In a real app, this data would be fetched from a secure backend.
    // For this demo, we are reading from localStorage.
    setAllCoupons(getFromStorage<Coupon>('supersorteios_coupons'));
    setAllSales(getFromStorage<Sale>('supersorteios_sales'));
  }, [isAuthenticated]); // Re-fetch if authenticated

  const getSaleForCoupon = (coupon: Coupon) => {
    return allSales.find(sale => sale.id === coupon.saleId);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Acesso concedido',
        description: 'Bem-vindo ao painel do administrador.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'A senha inserida está incorreta.',
      });
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <KeyRound className="w-6 h-6" />
                Acesso Restrito
              </CardTitle>
              <CardDescription>
                Por favor, insira a senha para acessar o painel do administrador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2" />
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
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
                      <TableHead>Nome do Vendedor</TableHead>
                      <TableHead>CPF</TableHead>
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
                            <TableCell>{sale ? sale.sellerName : 'N/A'}</TableCell>
                            <TableCell className="font-mono text-sm">{sale ? sale.cpf : 'N/A'}</TableCell>
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
