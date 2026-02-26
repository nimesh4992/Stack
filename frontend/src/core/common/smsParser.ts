// 📱 SMS Parser for Indian Bank Transactions
// Parses SMS messages from major Indian banks to extract transaction details

export interface ParsedTransaction {
  type: 'expense' | 'income';
  amount: number;
  merchantName?: string;
  bankName: string;
  accountLast4?: string;
  date: string;
  referenceNumber?: string;
  balance?: number;
}

// Bank SMS patterns for major Indian banks
// IMPORTANT: Patterns are designed to capture the TRANSACTION amount, not the balance
// The balance pattern is separate and explicitly excludes balance-related keywords in debit/credit patterns
const BANK_PATTERNS = {
  // HDFC Bank
  // Example: "HDFC Bank: INR 1,250.00 has been debited from A/c XX1234 for purchase at AMAZON on 25-Feb-26. Avl Bal: INR 45,678.90"
  hdfc: {
    name: 'HDFC Bank',
    // Match amount ONLY when followed by "debited" - stops before balance
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*debited.*?(?:at|to|for|on)\s+([A-Za-z0-9\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*credited/i,
    balance: /(?:Avl\s*Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct|Account)\s*[xX*]+([\d]{4})/i,
  },
  // ICICI Bank
  icici: {
    name: 'ICICI Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent).*?(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|received)/i,
    balance: /(?:Avl\s*Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:Acct|Account)\s*[xX*]+([\d]{4})/i,
  },
  // SBI (State Bank of India)
  // Example: "SBI: Rs.500 debited from A/c XX9012 for UPI/P2M/SWIGGY on 25-Feb. Bal: Rs.12,345.67"
  sbi: {
    name: 'SBI',
    debit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|withdrawn).*?(?:for|at|to)\s+([A-Za-z0-9\/\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Bal|$)/i,
    credit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|deposited)/i,
    balance: /(?:Bal|Balance)[:\s]*(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct)\s*[xX*]+([\d]{4})/i,
  },
  // Axis Bank
  // Example: "Axis Bank: INR 2,500.00 spent on Credit Card XX4567 at FLIPKART on 25-Feb-26. Avl Bal: INR 97,500.00"
  axis: {
    name: 'Axis Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent).*?(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Avl\s*Bal|Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  // Kotak Mahindra Bank
  // Example: "Kotak: INR 3,999.00 debited from your A/c XX7890 for purchase at MYNTRA. Bal: INR 28,001.00"
  kotak: {
    name: 'Kotak Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited).*?(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?=\s*\.\s*|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  // Generic pattern for UPI transactions
  // Example: "UPI: Money sent! Rs.150 debited from Paytm Wallet to ZOMATO@paytm. Wallet Bal: Rs.850.00"
  upi: {
    name: 'UPI',
    debit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|sent).*?(?:to|at)\s+([A-Za-z0-9@\s]+?)(?=\s*\.\s*|\s*Wallet|\s*Bal|$)/i,
    credit: /(?:credited|received).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    balance: /(?:Wallet\s*Bal|Bal)[:\s]*(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
};

// Detect which bank the SMS is from
function detectBank(sms: string): keyof typeof BANK_PATTERNS | null {
  const smsLower = sms.toLowerCase();
  
  if (smsLower.includes('hdfc') || smsLower.includes('hdfcbk')) return 'hdfc';
  if (smsLower.includes('icici') || smsLower.includes('icicib')) return 'icici';
  if (smsLower.includes('sbi') || smsLower.includes('state bank') || smsLower.includes('sbiinb')) return 'sbi';
  if (smsLower.includes('axis') || smsLower.includes('axisbk')) return 'axis';
  if (smsLower.includes('kotak') || smsLower.includes('kotakb')) return 'kotak';
  if (smsLower.includes('upi') || smsLower.includes('paytm') || smsLower.includes('phonepe') || smsLower.includes('gpay') || smsLower.includes('@')) return 'upi';
  
  return null;
}

// Parse amount string to number
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/,/g, ''));
}

// Main SMS parser function
export function parseSMS(sms: string): ParsedTransaction | null {
  if (!sms || sms.trim().length === 0) {
    return null;
  }
  
  const bank = detectBank(sms);
  
  if (!bank) {
    // Try generic patterns
    return parseGenericSMS(sms);
  }
  
  const patterns = BANK_PATTERNS[bank];
  
  // Try debit pattern first
  const debitMatch = sms.match(patterns.debit);
  if (debitMatch) {
    const amount = parseAmount(debitMatch[1]);
    const merchant = debitMatch[2]?.trim() || 'Unknown';
    const balanceMatch = sms.match(patterns.balance);
    const accountMatch = sms.match(patterns.account);
    
    return {
      type: 'expense',
      amount,
      merchantName: merchant,
      bankName: patterns.name,
      accountLast4: accountMatch?.[1],
      date: new Date().toISOString(),
      balance: balanceMatch ? parseAmount(balanceMatch[1]) : undefined,
    };
  }
  
  // Try credit pattern
  const creditMatch = sms.match(patterns.credit);
  if (creditMatch) {
    const amount = parseAmount(creditMatch[1]);
    const balanceMatch = sms.match(patterns.balance);
    const accountMatch = sms.match(patterns.account);
    
    return {
      type: 'income',
      amount,
      bankName: patterns.name,
      accountLast4: accountMatch?.[1],
      date: new Date().toISOString(),
      balance: balanceMatch ? parseAmount(balanceMatch[1]) : undefined,
    };
  }
  
  // If bank-specific patterns didn't work, try generic
  return parseGenericSMS(sms);
}

// Generic SMS parser for unknown bank formats
function parseGenericSMS(sms: string): ParsedTransaction | null {
  // First, try to identify if there's a balance mentioned so we can exclude it
  const hasBalance = /(?:avl\s*bal|balance|bal)[:\s]/i.test(sms);
  
  // Extract all amounts from the SMS - multiple patterns
  const amountPatterns = [
    /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)/gi,
    /(?:INR|Rs\.?|₹)([\d,]+(?:\.\d{2})?)/gi,
  ];
  
  let allAmounts: RegExpMatchArray[] = [];
  for (const pattern of amountPatterns) {
    const matches = [...sms.matchAll(pattern)];
    if (matches.length > 0) {
      allAmounts = matches;
      break;
    }
  }
  
  // Determine if it's a debit or credit
  const isDebit = /(?:debited|spent|withdrawn|paid|sent|purchase|deducted)/i.test(sms);
  const isCredit = /(?:credited|received|deposited|added|refund)/i.test(sms);
  
  if (allAmounts.length === 0) return null;
  
  // If there are multiple amounts and we have a balance indicator,
  // the transaction amount is typically the FIRST amount mentioned (before balance)
  let transactionAmount: number;
  
  if (hasBalance && allAmounts.length >= 2) {
    // First amount is usually the transaction, second is balance
    transactionAmount = parseAmount(allAmounts[0][1]);
  } else if (allAmounts.length === 1) {
    // Only one amount - that's our transaction
    transactionAmount = parseAmount(allAmounts[0][1]);
  } else {
    // Multiple amounts without clear balance indicator - use first amount
    transactionAmount = parseAmount(allAmounts[0][1]);
  }
  
  // Extract balance if present (usually the last amount after "Bal" keyword)
  let balance: number | undefined;
  if (hasBalance && allAmounts.length >= 2) {
    balance = parseAmount(allAmounts[allAmounts.length - 1][1]);
  }
  
  // Try to extract merchant name with multiple patterns
  let merchantName: string | undefined;
  const merchantPatterns = [
    /(?:at|to|for|@)\s+([A-Za-z0-9\s@_-]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|\s*VPA|$)/i,
    /(?:purchase\s+at|payment\s+to|transfer\s+to)\s+([A-Za-z0-9\s@_-]+?)(?=\s+on|\s*\.|\s*Avl|\s*Bal|$)/i,
    /VPA\s*[:\s]*([A-Za-z0-9@._-]+)/i,
  ];
  
  for (const pattern of merchantPatterns) {
    const match = sms.match(pattern);
    if (match) {
      merchantName = match[1].trim();
      break;
    }
  }
  
  // Try to extract account number
  const accountMatch = sms.match(/(?:A\/c|Acct|Account|Card)[:\s]*[xX*]*([\d]{4})/i);
  
  if (isDebit) {
    return {
      type: 'expense',
      amount: transactionAmount,
      merchantName,
      bankName: 'Bank',
      accountLast4: accountMatch?.[1],
      date: new Date().toISOString(),
      balance,
    };
  }
  
  if (isCredit) {
    return {
      type: 'income',
      amount: transactionAmount,
      merchantName,
      bankName: 'Bank',
      accountLast4: accountMatch?.[1],
      date: new Date().toISOString(),
      balance,
    };
  }
  
  // If we can't determine type but have an amount, return as expense (most common case)
  if (transactionAmount > 0) {
    return {
      type: 'expense',
      amount: transactionAmount,
      merchantName,
      bankName: 'Bank',
      accountLast4: accountMatch?.[1],
      date: new Date().toISOString(),
      balance,
    };
  }
  
  return null;
}

// Sample SMS messages for testing
export const SAMPLE_SMS_MESSAGES = [
  {
    id: '1',
    sender: 'HDFCBK',
    message: 'HDFC Bank: INR 1,250.00 has been debited from A/c XX1234 for purchase at AMAZON on 25-Feb-26. Avl Bal: INR 45,678.90',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    sender: 'ICICIB',
    message: 'ICICI Bank: Your Acct XX5678 is credited with INR 50,000.00 on 25-Feb. Avl Bal: INR 75,000.00.',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    sender: 'SBIINB',
    message: 'SBI: Rs.500 debited from A/c XX9012 for UPI/P2M/SWIGGY on 25-Feb. Bal: Rs.12,345.67',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    sender: 'AXISBK',
    message: 'Axis Bank: INR 2,500.00 spent on Credit Card XX4567 at FLIPKART on 25-Feb-26. Avl Bal: INR 97,500.00',
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    sender: 'PAYTM',
    message: 'UPI: Money sent! Rs.150 debited from Paytm Wallet to ZOMATO@paytm. Wallet Bal: Rs.850.00',
    timestamp: new Date().toISOString(),
  },
  {
    id: '6',
    sender: 'KOTAKB',
    message: 'Kotak: INR 3,999.00 debited from your A/c XX7890 for purchase at MYNTRA. Bal: INR 28,001.00',
    timestamp: new Date().toISOString(),
  },
];

// Category mapping based on merchant name
export function guessCategory(merchantName: string): { id: string; label: string; icon: string } {
  const merchant = merchantName.toLowerCase();
  
  // Food & Dining
  if (/swiggy|zomato|uber\s*eats|dominos|pizza|mcdonalds|kfc|burger|cafe|restaurant|food/i.test(merchant)) {
    return { id: 'food', label: 'Food', icon: 'fast-food' };
  }
  
  // Shopping
  if (/amazon|flipkart|myntra|ajio|shoppers|mall|store|mart|retail/i.test(merchant)) {
    return { id: 'shopping', label: 'Shopping', icon: 'bag' };
  }
  
  // Transport
  if (/uber|ola|rapido|metro|irctc|redbus|makemytrip|fuel|petrol|diesel/i.test(merchant)) {
    return { id: 'transport', label: 'Transport', icon: 'car' };
  }
  
  // Entertainment
  if (/netflix|hotstar|prime|spotify|gaana|pvr|inox|movie|game/i.test(merchant)) {
    return { id: 'entertainment', label: 'Entertainment', icon: 'game-controller' };
  }
  
  // Bills & Utilities
  if (/electricity|water|gas|airtel|jio|vodafone|vi|bsnl|broadband|wifi|recharge/i.test(merchant)) {
    return { id: 'bills', label: 'Bills', icon: 'receipt' };
  }
  
  // Health
  if (/apollo|medplus|netmeds|pharmeasy|hospital|clinic|doctor|medical/i.test(merchant)) {
    return { id: 'health', label: 'Health', icon: 'medkit' };
  }
  
  // Default
  return { id: 'other', label: 'Other', icon: 'wallet' };
}
