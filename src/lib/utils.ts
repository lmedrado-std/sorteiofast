import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica se a campanha está ativa comparando a data atual
 * com a data fim configurada. Trata o valor como UTC para
 * evitar desvios de fuso horário.
 */
export function isCampaignActive(campaignEndDate: string): boolean {
  if (!campaignEndDate) return false;

  const isoString = campaignEndDate.endsWith("Z")
    ? campaignEndDate
    : `${campaignEndDate}Z`;

  const target = new Date(isoString);
  if (Number.isNaN(target.getTime())) return false;

  return new Date() < target;
}
