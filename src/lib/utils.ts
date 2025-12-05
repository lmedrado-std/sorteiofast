import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, startOfDay, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isCampaignActive(endDate: Date | null | undefined): boolean {
  if (!endDate) return false;

  const now = new Date();

  // campanha ativa até o fim do dia configurado
  const limit = startOfDay(addDays(endDate, 1));

  return isBefore(now, limit);
}
