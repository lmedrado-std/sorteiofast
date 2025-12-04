
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/app/AppHeader';

const ADMIN_PASSWORD = "admin"; // Senha para acesso ao painel

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  
  // No real app, you'd use a more secure auth check.
  // We'll use a session storage flag for this demo.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('adminAuthenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      router.replace('/admin/dashboard');
    }
  }, [router]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      toast({
        title: 'Acesso concedido',
        description: 'Bem-vindo ao painel do administrador.',
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'A senha inserida está incorreta.',
      });
      setPassword('');
    }
  };

  // If we are checking auth or already authed, show a loader or nothing
  if (isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Redirecionando...</p>
      </div>
    );
  }

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

    