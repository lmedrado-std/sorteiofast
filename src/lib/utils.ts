
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica se a campanha está ativa comparando a data atual
 * com a data fim configurada, tratando-a como data local.
 */
export function isCampaignActive(campaignEndDate: string): boolean {
  if (!campaignEndDate) return false;

  // Interpreta a string de data como sendo do fuso horário local.
  const target = new Date(campaignEndDate);
  if (Number.isNaN(target.getTime())) return false;

  // Compara com a data e hora locais atuais.
  return new Date() < target;
}
