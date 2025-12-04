
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

const settingsSchema = z.object({
  couponValueThreshold: z.coerce.number().int().positive('O valor deve ser um número inteiro positivo.'),
  campaignEndDate: z.string().min(1, 'A data final é obrigatória.'),
});

interface CampaignSettingsProps {
  currentConfig: CampaignConfig;
  onSave: (newConfig: CampaignConfig) => void;
}

// Helper to format date to "yyyy-MM-ddTHH:mm" for the input
const formatDateForInput = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CampaignSettings({ currentConfig, onSave }: CampaignSettingsProps) {
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      couponValueThreshold: currentConfig.couponValueThreshold,
      campaignEndDate: formatDateForInput(currentConfig.campaignEndDate),
    },
    // Re-initialize form when currentConfig changes
    enableReinitialize: true,
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    onSave({
        couponValueThreshold: data.couponValueThreshold,
        campaignEndDate: new Date(data.campaignEndDate), // Convert back to Date object on save
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
