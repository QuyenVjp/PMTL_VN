/**
 * Bank Account Pattern Detector
 * Pure utility for detecting bank account numbers, cards, and e-wallet patterns
 * in Vietnamese and international contexts.
 *
 * Patterns detected:
 * - Vietnamese Bank Accounts (STK): 9-14 digits after bank context
 * - IBAN: International Bank Account Numbers
 * - Card numbers: Luhn-checkable credit/debit cards
 * - E-wallet identifiers
 *
 * Key design: High confidence threshold to reduce false positives (phone numbers, etc)
 */

/**
 * Confidence levels for matched patterns
 * HIGH: Strong contextual evidence or format match (e.g., IBAN with country code)
 * MEDIUM: Pattern matches but less contextual evidence (e.g., VN STK with bank name nearby)
 * LOW: Could be a false positive but warrants review (e.g., 10 random digits)
 */
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

/**
 * Account type classification
 */
export type AccountType = "VN_ACCOUNT" | "IBAN" | "CARD" | "EWALLET" | "UNKNOWN";

/**
 * Bank pattern match result
 */
export interface BankPatternMatch {
  pattern: string;
  matchedText: string;
  confidence: ConfidenceLevel;
  type: AccountType;
  context?: string; // surrounding text for debugging
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Vietnamese bank names and abbreviations
 * Used for contextual matching to increase confidence
 */
const VIETNAMESE_BANK_NAMES = [
  // Major banks
  "Vietcombank",
  "BIDV",
  "MB Bank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "Techcombank",
  "VietinBank",
  "Agribank",
  "SHB",
  "EximBank",
  "HDBBank",
  "SeABank",
  "BaoVietBank",
  "MSB",
  "PVcomBank",
  "Vietbank",
  "Kienlongbank",
  "LienVietPostBank",
  // Abbreviations
  "VCB",
  "CTG", // BIDV
  "MBB", // MB Bank
  "ACB",
  "VPB",
  "TPB",
  "STB",
  "TCB",
  "CTB",
  "AGB",
  "SHB",
  "EIB",
  "HDB",
  "SBV",
  "BVB",
  "MSB",
  "PVB",
  "VBB",
  "KLB",
  "LPB",
];

/**
 * Luhn algorithm for credit/debit card validation
 * Used to verify card numbers have correct checksums
 */
function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detect IBAN patterns with country codes
 * IBAN structure: 2-letter country code, 2 check digits, up to 30 alphanumeric
 */
function detectIBAN(text: string): BankPatternMatch[] {
  const results: BankPatternMatch[] = [];
  // IBAN: 2-letter country code + 2-4 check digits + up to 26 more chars
  const ibanRegex = /\b([A-Z]{2}\d{2}[A-Z0-9]{1,30})\b/g;

  let match: RegExpExecArray | null;
  while ((match = ibanRegex.exec(text)) !== null) {
    const ibanCode = match[1];
    // Valid IBAN has even length between 15-34 chars
    if (ibanCode.length % 2 === 0 && ibanCode.length >= 15 && ibanCode.length <= 34) {
      results.push({
        pattern: "IBAN",
        matchedText: ibanCode,
        confidence: "HIGH",
        type: "IBAN",
        position: { start: match.index, end: match.index + ibanCode.length },
      });
    }
  }

  return results;
}

/**
 * Detect Vietnamese bank account numbers (STK)
 * Vietnamese bank accounts are typically 9-14 digits after bank context
 * Examples: Vietcombank 1234567890, Acc: 98765432101
 */
function detectVietnamseAccount(text: string): BankPatternMatch[] {
  const results: BankPatternMatch[] = [];

  // Pattern 1: Bank name/code followed by account number
  // "Vietcombank 1234567890" or "MB: 98765432101"
  const bankContextRegex = new RegExp(
    `(${VIETNAMESE_BANK_NAMES.join("|")})\\s*:?\\s*(\\d{9,14})`,
    "gi",
  );

  let match: RegExpExecArray | null;
  while ((match = bankContextRegex.exec(text)) !== null) {
    const bankName = match[1];
    const accountNumber = match[2];

    results.push({
      pattern: `VN_STK (${bankName})`,
      matchedText: accountNumber,
      confidence: "HIGH",
      type: "VN_ACCOUNT",
      context: `${bankName} ${accountNumber}`,
      position: { start: match.index + match[1].length + 1, end: match.index + match[0].length },
    });
  }

  // Pattern 2: Account keywords followed by number
  // "STK: 1234567890", "Tài khoản: 98765432101", "Account: 12345678901"
  const accountKeywordRegex = /(STK|Tài\s*khoản|Account|Số\s*TK)\s*:?\s*(\d{9,14})/gi;

  let keywordMatch: RegExpExecArray | null;
  while ((keywordMatch = accountKeywordRegex.exec(text)) !== null) {
    const accountNumber = keywordMatch[2];

    // Skip if it looks like a phone number (starts with 0, length 10, common pattern)
    if (!/^0\d{9}$/.test(accountNumber)) {
      results.push({
        pattern: `VN_STK (${keywordMatch[1]})`,
        matchedText: accountNumber,
        confidence: "MEDIUM",
        type: "VN_ACCOUNT",
        context: keywordMatch[0],
        position: { start: keywordMatch.index, end: keywordMatch.index + keywordMatch[0].length },
      });
    }
  }

  return results;
}

/**
 * Detect credit/debit card numbers
 * Looking for 13-19 consecutive digits that pass Luhn checksum
 */
function detectCardNumbers(text: string): BankPatternMatch[] {
  const results: BankPatternMatch[] = [];

  // Remove common separators and look for card-length digit sequences
  const cardRegex = /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g;

  let match: RegExpExecArray | null;
  while ((match = cardRegex.exec(text)) !== null) {
    const cleanedCard = match[1].replace(/\D/g, "");

    if (isValidLuhn(cleanedCard)) {
      results.push({
        pattern: "CARD_16_DIGIT",
        matchedText: cleanedCard,
        confidence: "HIGH",
        type: "CARD",
        context: match[0],
        position: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // Also check for unseparated 13-19 digit sequences
  const unseparatedCardRegex = /\b(\d{13,19})\b/g;

  let unseparatedMatch: RegExpExecArray | null;
  while ((unseparatedMatch = unseparatedCardRegex.exec(text)) !== null) {
    const cardNumber = unseparatedMatch[1];

    // Skip if already found in separated format
    if (
      isValidLuhn(cardNumber) &&
      !results.some(
        (r) =>
          r.matchedText === cardNumber &&
          r.position &&
          r.position.start <= unseparatedMatch!.index &&
          r.position.end >= unseparatedMatch!.index + cardNumber.length,
      )
    ) {
      results.push({
        pattern: "CARD_UNSEPARATED",
        matchedText: cardNumber,
        confidence: "MEDIUM",
        type: "CARD",
        position: { start: unseparatedMatch.index, end: unseparatedMatch.index + cardNumber.length },
      });
    }
  }

  return results;
}

/**
 * Detect e-wallet identifiers
 * Phone Pay, Momo, Viettel Pay, etc.
 */
function detectEWallet(text: string): BankPatternMatch[] {
  const results: BankPatternMatch[] = [];

  const ewalletPatterns = [
    // Momo phone number (Vietnamese format)
    {
      regex: /(Momo\s*:?\s*)(0\d{9})/gi,
      walletType: "MOMO",
    },
    // ViettelPay, PayToo, ShopeePay patterns
    {
      regex: /(ViettelPay|PayToo|ShopeePay|Zalo\s*Pay)\s*:?\s*(0\d{9})/gi,
      walletType: "EWALLET_VN",
    },
    // Apple Pay / Google Pay (detected by presence of keywords near card)
    {
      regex: /(Apple\s*Pay|Google\s*Pay)\s*:?\s*(\d{13,19})/gi,
      walletType: "DIGITAL_WALLET",
    },
  ];

  for (const pattern of ewalletPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(text)) !== null) {
      results.push({
        pattern: `EWALLET_${pattern.walletType}`,
        matchedText: match[2],
        confidence: "HIGH",
        type: "EWALLET",
        context: match[0],
        position: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  return results;
}

/**
 * Main detector function
 * Scans text for all types of financial account patterns
 *
 * @param text - Text to scan for financial patterns
 * @returns Array of detected patterns sorted by confidence
 */
export function detectBankPatterns(text: string): BankPatternMatch[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Normalize whitespace but preserve structure
  const normalized = text.trim();

  // Run all detectors
  const allMatches: BankPatternMatch[] = [
    ...detectIBAN(normalized),
    ...detectVietnamseAccount(normalized),
    ...detectCardNumbers(normalized),
    ...detectEWallet(normalized),
  ];

  // Remove duplicates (same matched text at same position)
  const seen = new Set<string>();
  const unique = allMatches.filter((match) => {
    const key = `${match.matchedText}@${match.position?.start || 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by confidence (HIGH > MEDIUM > LOW), then by position
  return unique.sort((a, b) => {
    const confidenceOrder: Record<ConfidenceLevel, number> = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2,
    };
    const confDiff =
      confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    if (confDiff !== 0) return confDiff;

    const posA = a.position?.start ?? 0;
    const posB = b.position?.start ?? 0;
    return posA - posB;
  });
}

/**
 * Check if text contains any high-confidence financial patterns
 * Quick boolean check without returning full match details
 */
export function containsFinancialPattern(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  const matches = detectBankPatterns(text);
  return matches.some((m) => m.confidence === "HIGH");
}

/**
 * Get all matched text (masked for safe logging)
 * Useful for audit logs that should not contain full account numbers
 */
export function getMatchedFinancialTexts(text: string): string[] {
  const matches = detectBankPatterns(text);
  return matches.map((m) => {
    const matched = m.matchedText;
    if (matched.length <= 4) return "*".repeat(matched.length);
    // Show first 2 and last 2 chars only
    return matched.substring(0, 2) + "*".repeat(matched.length - 4) + matched.substring(matched.length - 2);
  });
}

/**
 * Scan multiple texts and return consolidated results
 * Used for batch processing of user-generated content
 */
export function scanMultipleTexts(
  texts: Record<string, string | undefined>,
  options?: {
    maskResults?: boolean;
    onlyHighConfidence?: boolean;
  },
): { text: string; matches: BankPatternMatch[] }[] {
  return Object.entries(texts)
    .filter(([_key, value]) => value && typeof value === "string")
    .map(([key, value]) => {
      let matches = detectBankPatterns(value!);

      if (options?.onlyHighConfidence) {
        matches = matches.filter((m) => m.confidence === "HIGH");
      }

      if (options?.maskResults) {
        matches = matches.map((m) => ({
          ...m,
          matchedText: "*".repeat(m.matchedText.length),
        }));
      }

      return { text: key, matches };
    });
}
