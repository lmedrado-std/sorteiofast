
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import type { CampaignConfig } from '@/app/admin/dashboard/page';
import { format, parse } from 'date-fns';

const settingsSchema = z.object({
  couponValueThreshold: z.coerce.number().int().positive('O valor deve ser um número inteiro positivo.'),
  campaignEndDate: z.string().min(1, 'A data final é obrigatória.'),
});

interface CampaignSettingsProps {
  currentConfig: CampaignConfig;
  onSave: (newConfig: CampaignConfig) => void;
}

export default function CampaignSettings({ currentConfig, onSave }: CampaignSettingsProps) {
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      ...currentConfig,
      campaignEndDate: format(new Date(currentConfig.campaignEndDate), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    // Converte a data local do input para um objeto Date
    const localDate = parse(data.campaignEndDate, "yyyy-MM-dd'T'HH:mm", new Date());
    // Formata a data para uma string ISO 8601 completa (YYYY-MM-DDTHH:mm:ssZ)
    const isoDateString = localDate.toISOString();
    
    onSave({
        couponValueThreshold: data.couponValueThreshold,
        campaignEndDate: isoDateString
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-primary" />
          Configurações da Campanha
        </CardTitle>
        <CardDescription>
          Ajuste os parâmetros principais da campanha de vendas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="couponValueThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por Cupom (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="campaignEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Final da Campanha</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit">
                <Save className="mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
