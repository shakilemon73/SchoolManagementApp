import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { jsPDF } from "jspdf";
import { format, formatRelative, Locale } from "date-fns";
import { enUS, bn, arSA } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date according to the specified format and locale
 * @param date - Date to format
 * @param formatStr - Format string for date-fns
 * @param locale - Locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, formatStr: string = "PPP", locale: string = "english"): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Map to date-fns locales
    const localeMap: Record<string, Locale> = {
      english: enUS,
      bengali: bn,
      arabic: arSA,
    };
    
    const dateLocale = localeMap[locale] || enUS;
    
    return format(dateObj, formatStr, { locale: dateLocale });
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
}

/**
 * Formats a currency value based on the locale and currency symbol
 * @param amount - Amount to format
 * @param currencySymbol - Currency symbol to use
 * @param locale - Locale to use for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currencySymbol = '৳', locale: string = "english"): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${currencySymbol}0.00`;
  
  let localeCode = 'en-US';
  if (locale === 'bengali') localeCode = 'bn-BD';
  if (locale === 'arabic') localeCode = 'ar-SA';
  
  return `${currencySymbol}${numAmount.toLocaleString(localeCode, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Generate PDF from an HTML canvas
 * @param canvas - HTML canvas element 
 * @param pageSize - Page format (e.g., 'A4', 'letter')
 * @param orientation - Page orientation ('portrait' or 'landscape')
 * @returns jsPDF instance
 */
export function generatePDF(canvas: HTMLCanvasElement, pageSize = 'A4', orientation = 'portrait') {
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: orientation as 'portrait' | 'landscape',
    unit: 'mm',
    format: pageSize
  });
  
  // Calculate dimensions to fit the canvas into the PDF
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  return pdf;
}

export function downloadExcel(data: any[], filename: string) {
  // This is a placeholder function for Excel download
  // The actual implementation will use SheetJS in the components
  console.log("Downloading Excel with data", data, filename);
}
