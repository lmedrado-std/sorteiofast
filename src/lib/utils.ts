

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica se a campanha está ativa comparando a data atual
 * com a data fim configurada.
 */
export function isCampaignActive(campaignEndDate: string | Date): boolean {
  if (!campaignEndDate) return false;

  const targetDate = typeof campaignEndDate === 'string' ? new Date(campaignEndDate) : campaignEndDate;

  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  return new Date() < targetDate;
}
