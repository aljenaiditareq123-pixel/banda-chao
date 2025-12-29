/**
 * Finance Configuration
 * Company financial and tax details for Stripe and Invoice integration
 * 
 * ⚠️ SECURITY NOTE: These are company registration details (public information).
 * Sensitive credentials should be stored in environment variables, not here.
 */

/**
 * Tax Registration Number (TRN)
 * UAE VAT Tax Registration Number issued by FTA
 */
export const TAX_REGISTRATION_NUMBER = '105281937000001';

/**
 * Wio Bank Account Number
 * Account number for Wio business banking
 */
export const WIO_ACCOUNT_NUMBER = '9603518493';

/**
 * Wio Bank IBAN
 * International Bank Account Number for Wio account (starts with AE)
 */
export const WIO_IBAN = 'AE670860000009603518493';

/**
 * Finance Configuration Object
 * Centralized export for all financial constants
 */
export const financeConfig = {
  taxRegistrationNumber: TAX_REGISTRATION_NUMBER,
  wioAccountNumber: WIO_ACCOUNT_NUMBER,
  wioIBAN: WIO_IBAN,
} as const;

/**
 * Check if finance configuration is complete
 * Returns true if all required values are set (not placeholders)
 */
export function isFinanceConfigComplete(): boolean {
  const iban = String(WIO_IBAN);
  return (
    TAX_REGISTRATION_NUMBER.length > 0 &&
    WIO_ACCOUNT_NUMBER.length > 0 &&
    iban.length > 0 &&
    iban !== 'PASTE_YOUR_AE_IBAN_HERE' &&
    iban.startsWith('AE')
  );
}

/**
 * Get finance configuration summary
 * Useful for logging or validation
 */
export function getFinanceConfigSummary(): {
  taxRegistrationNumber: string;
  wioAccountNumber: string;
  wioIBAN: string;
  isComplete: boolean;
} {
  return {
    taxRegistrationNumber: TAX_REGISTRATION_NUMBER,
    wioAccountNumber: WIO_ACCOUNT_NUMBER,
    wioIBAN: WIO_IBAN,
    isComplete: isFinanceConfigComplete(),
  };
}
