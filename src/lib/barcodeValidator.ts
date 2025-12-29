/**
 * Barcode validation utility for EAN-8, EAN-13, and UPC-A formats
 */

export interface BarcodeValidationResult {
  isValid: boolean;
  format: 'EAN-8' | 'EAN-13' | 'UPC-A' | 'unknown';
  normalized: string;
  error?: string;
}

/**
 * Calculate the check digit for EAN/UPC barcodes
 */
function calculateCheckDigit(digits: string): number {
  const length = digits.length;
  let sum = 0;
  
  for (let i = 0; i < length; i++) {
    const digit = parseInt(digits[i], 10);
    // For EAN-13/UPC-A: odd positions (from right, excluding check digit) multiply by 3
    // For EAN-8: even positions (from left) multiply by 3
    if (length === 12 || length === 7) {
      // Without check digit
      sum += digit * (i % 2 === 0 ? 1 : 3);
    } else {
      // With check digit - validate
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

/**
 * Validate an EAN-8 barcode (8 digits)
 */
function validateEAN8(barcode: string): boolean {
  if (barcode.length !== 8) return false;
  if (!/^\d{8}$/.test(barcode)) return false;
  
  const digits = barcode.slice(0, 7);
  const checkDigit = parseInt(barcode[7], 10);
  const calculated = calculateCheckDigit(digits);
  
  return checkDigit === calculated;
}

/**
 * Validate an EAN-13 barcode (13 digits)
 */
function validateEAN13(barcode: string): boolean {
  if (barcode.length !== 13) return false;
  if (!/^\d{13}$/.test(barcode)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(barcode[12], 10) === checkDigit;
}

/**
 * Validate a UPC-A barcode (12 digits)
 */
function validateUPCA(barcode: string): boolean {
  if (barcode.length !== 12) return false;
  if (!/^\d{12}$/.test(barcode)) return false;
  
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(barcode[11], 10) === checkDigit;
}

/**
 * Normalize a barcode string by removing spaces, dashes, and other non-numeric characters
 */
export function normalizeBarcode(barcode: string): string {
  return barcode.replace(/[^0-9]/g, '');
}

/**
 * Validate a barcode and determine its format
 */
export function validateBarcode(input: string): BarcodeValidationResult {
  const normalized = normalizeBarcode(input);
  
  if (!normalized) {
    return {
      isValid: false,
      format: 'unknown',
      normalized: '',
      error: 'Barcode is empty',
    };
  }
  
  // Check EAN-8
  if (normalized.length === 8) {
    const isValid = validateEAN8(normalized);
    return {
      isValid,
      format: 'EAN-8',
      normalized,
      error: isValid ? undefined : 'Invalid EAN-8 check digit',
    };
  }
  
  // Check UPC-A
  if (normalized.length === 12) {
    const isValid = validateUPCA(normalized);
    return {
      isValid,
      format: 'UPC-A',
      normalized,
      error: isValid ? undefined : 'Invalid UPC-A check digit',
    };
  }
  
  // Check EAN-13
  if (normalized.length === 13) {
    const isValid = validateEAN13(normalized);
    return {
      isValid,
      format: 'EAN-13',
      normalized,
      error: isValid ? undefined : 'Invalid EAN-13 check digit',
    };
  }
  
  return {
    isValid: false,
    format: 'unknown',
    normalized,
    error: `Invalid barcode length: ${normalized.length}. Expected 8, 12, or 13 digits.`,
  };
}

/**
 * Check if a string looks like a barcode (contains mostly digits)
 */
export function looksLikeBarcode(input: string): boolean {
  const normalized = normalizeBarcode(input);
  return normalized.length >= 8 && normalized.length <= 13;
}

/**
 * Convert UPC-A to EAN-13 by prepending a 0
 */
export function upcaToEan13(upca: string): string {
  const normalized = normalizeBarcode(upca);
  if (normalized.length === 12) {
    return '0' + normalized;
  }
  return normalized;
}
