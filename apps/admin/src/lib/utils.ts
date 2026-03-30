import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPageNumbers(currentPage: number, totalPages: number) {
  const range = 2;
  const pages: (number | string)[] = [];
  
  // Always include first page
  pages.push(1);
  
  if (currentPage - range > 2) {
    pages.push('...');
  }
  
  // Add pages around current page
  for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
    pages.push(i);
  }
  
  if (currentPage + range < totalPages - 1) {
    pages.push('...');
  }
  
  // Always include last page if it's different from first
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
}
