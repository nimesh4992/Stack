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
const BANK_PATTERNS = {
  // HDFC Bank
  hdfc: {
    name: 'HDFC Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*debited.*?(?:at|to|for)\s+([A-Za-z0-9\s]+)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*credited/i,
    balance: /(?:Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct|Account)\s*[xX*]+([\d]{4})/i,
  },
  // ICICI Bank
  icici: {
    name: 'ICICI Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent).*?(?:at|to|for)\s+([A-Za-z0-9\s]+)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|received)/i,
    balance: /(?:Avl Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:Acct|Account)\s*[xX*]+([\d]{4})/i,
  },
  // SBI (State Bank of India)
  sbi: {
    name: 'SBI',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|withdrawn).*?(?:at|to|for)?\s*([A-Za-z0-9\s]*)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|deposited)/i,
    balance: /(?:Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct)\s*[xX*]+([\d]{4})/i,
  },
  // Axis Bank
  axis: {
    name: 'Axis Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent).*?(?:at|to|for)\s+([A-Za-z0-9\s]+)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  // Kotak Mahindra Bank
  kotak: {
    name: 'Kotak Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited).*?(?:at|to|for)\s+([A-Za-z0-9\s]+)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  // Generic pattern for UPI transactions
  upi: {
    name: 'UPI',
    debit: /(?:debited|sent).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?).*?(?:to|at)\s+([A-Za-z0-9@\s]+)/i,
    credit: /(?:credited|received).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    balance: /(?:Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
};

// Detect which bank the SMS is from
function detectBank(sms: string): keyof typeof BANK_PATTERNS | null {
  const smsLower = sms.toLowerCase();
  
  if (smsLower.includes('hdfc')) return 'hdfc';
  if (smsLower.includes('icici')) return 'icici';
  if (smsLower.includes('sbi') || smsLower.includes('state bank')) return 'sbi';
  if (smsLower.includes('axis')) return 'axis';
  if (smsLower.includes('kotak')) return 'kotak';
  if (smsLower.includes('upi') || smsLower.includes('@')) return 'upi';
  
  return null;
}

// Parse amount string to number
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/,/g, ''));
}

// Main SMS parser function
export function parseSMS(sms: string): ParsedTransaction | null {
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
  
  return null;
}

// Generic SMS parser for unknown bank formats
function parseGenericSMS(sms: string): ParsedTransaction | null {
  // Generic debit pattern
  const debitPattern = /(?:debited|spent|withdrawn|paid).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i;
  const creditPattern = /(?:credited|received|deposited).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i;
  
  // Also try amount-first patterns
  const amountFirstDebit = /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?).*?(?:debited|spent|withdrawn|paid)/i;
  const amountFirstCredit = /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?).*?(?:credited|received|deposited)/i;
  
  let match = sms.match(debitPattern) || sms.match(amountFirstDebit);
  if (match) {
    return {
      type: 'expense',
      amount: parseAmount(match[1]),
      bankName: 'Unknown Bank',
      date: new Date().toISOString(),
    };
  }
  
  match = sms.match(creditPattern) || sms.match(amountFirstCredit);
  if (match) {
    return {
      type: 'income',
      amount: parseAmount(match[1]),
      bankName: 'Unknown Bank',
      date: new Date().toISOString(),
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
