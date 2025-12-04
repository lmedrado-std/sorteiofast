import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the campaign is currently active by comparing the current date
 * with the campaign end date. It correctly handles timezone differences by
 * parsing the end date string as UTC.
 * @param campaignEndDate - The ISO string for the campaign's end date.
 * @returns `true` if the campaign is active, `false` otherwise.
 */
export function isCampaignActive(campaignEndDate: string): boolean {
  if (!campaignEndDate) return false;
  // Treat the string as UTC to avoid timezone shifts.
  // Example: "2024-12-31T23:59:00" becomes "2024-12-31T23:59:00Z"
  const utcTargetDate = new Date(campaignEndDate.endsWith('Z') ? campaignEndDate : `${campaignEndDate}Z`);
  return new Date() < utcTargetDate;
}
