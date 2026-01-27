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

export function isValidCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;

  const cpfClean = cpf.replace(/[^\d]/g, ''); // Remove non-digit characters

  if (cpfClean.length !== 11 || /^(\d)\1+$/.test(cpfClean)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpfClean.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpfClean.substring(10, 11))) {
    return false;
  }

  return true;
}
