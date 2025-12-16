import { format } from "date-fns";

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
export const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Convert an array of objects to CSV string
 */
export const arrayToCSV = (
  data: Record<string, any>[],
  columns: { key: string; header: string }[]
): string => {
  // Create header row
  const headerRow = columns.map((col) => escapeCSV(col.header)).join(",");
  
  // Create data rows
  const dataRows = data.map((row) =>
    columns.map((col) => escapeCSV(row[col.key])).join(",")
  );
  
  return [headerRow, ...dataRows].join("\n");
};

/**
 * Trigger CSV download in browser
 */
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format date for CSV export
 */
export const formatDateForCSV = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
  } catch {
    return dateString;
  }
};

/**
 * Format array for CSV export (joins with semicolons)
 */
export const formatArrayForCSV = (arr: any[] | null | undefined): string => {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join("; ");
};

/**
 * Generate filename with current date
 */
export const generateExportFilename = (prefix: string): string => {
  return `${prefix}-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
};
