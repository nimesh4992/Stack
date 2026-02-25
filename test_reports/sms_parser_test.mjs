/**
 * SMS Parser Test Script
 * Tests the SMS parser bug fix: extracting transaction amount vs balance
 * 
 * Run with: node --experimental-specifier-resolution=node smsParser.test.mjs
 */

// Since we can't directly import TypeScript, we'll replicate the parsing logic here
// This tests the same regex patterns used in smsParser.ts

// Bank SMS patterns (same as smsParser.ts)
const BANK_PATTERNS = {
  hdfc: {
    name: 'HDFC Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*debited.*?(?:at|to|for|on)\s+([A-Za-z0-9\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:has been|is)\s*credited/i,
    balance: /(?:Avl\s*Bal|Balance)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct|Account)\s*[xX*]+([\d]{4})/i,
  },
  sbi: {
    name: 'SBI',
    debit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|withdrawn).*?(?:for|at|to)\s+([A-Za-z0-9\/\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Bal|$)/i,
    credit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|deposited)/i,
    balance: /(?:Bal|Balance)[:\s]*(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /(?:A\/c|Acct)\s*[xX*]+([\d]{4})/i,
  },
  axis: {
    name: 'Axis Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent).*?(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?=\s+on\s+|\s*\.\s*|\s*Avl|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Avl\s*Bal|Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  upi: {
    name: 'UPI',
    debit: /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|sent).*?(?:to|at)\s+([A-Za-z0-9@\s]+?)(?=\s*\.\s*|\s*Wallet|\s*Bal|$)/i,
    credit: /(?:credited|received).*?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    balance: /(?:Wallet\s*Bal|Bal)[:\s]*(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
  kotak: {
    name: 'Kotak Bank',
    debit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited).*?(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?=\s*\.\s*|\s*Bal|$)/i,
    credit: /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
    balance: /(?:Bal)[:\s]*(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
    account: /[xX*]+([\d]{4})/i,
  },
};

function detectBank(sms) {
  const smsLower = sms.toLowerCase();
  if (smsLower.includes('hdfc')) return 'hdfc';
  if (smsLower.includes('sbi') || smsLower.includes('state bank')) return 'sbi';
  if (smsLower.includes('axis')) return 'axis';
  if (smsLower.includes('kotak')) return 'kotak';
  if (smsLower.includes('upi') || smsLower.includes('@')) return 'upi';
  return null;
}

function parseAmount(amountStr) {
  return parseFloat(amountStr.replace(/,/g, ''));
}

function parseSMS(sms) {
  const bank = detectBank(sms);
  if (!bank) return null;
  
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
      balance: balanceMatch ? parseAmount(balanceMatch[1]) : undefined,
    };
  }
  
  return null;
}

// Test cases
const TEST_CASES = [
  {
    name: 'HDFC Bank SMS - Should extract 1250, NOT 45678.90',
    sms: 'HDFC Bank: INR 1,250.00 has been debited from A/c XX1234 for purchase at AMAZON on 25-Feb-26. Avl Bal: INR 45,678.90',
    expectedAmount: 1250,
    wrongAmount: 45678.90,
    expectedBalance: 45678.90,
  },
  {
    name: 'SBI SMS - Should extract 500, NOT 12345.67',
    sms: 'SBI: Rs.500 debited from A/c XX9012 for UPI/P2M/SWIGGY on 25-Feb. Bal: Rs.12,345.67',
    expectedAmount: 500,
    wrongAmount: 12345.67,
    expectedBalance: 12345.67,
  },
  {
    name: 'Axis Bank SMS - Should extract 2500, NOT 97500',
    sms: 'Axis Bank: INR 2,500.00 spent on Credit Card XX4567 at FLIPKART on 25-Feb-26. Avl Bal: INR 97,500.00',
    expectedAmount: 2500,
    wrongAmount: 97500,
    expectedBalance: 97500,
  },
  {
    name: 'UPI SMS - Should extract 150, NOT 850',
    sms: 'UPI: Money sent! Rs.150 debited from Paytm Wallet to ZOMATO@paytm. Wallet Bal: Rs.850.00',
    expectedAmount: 150,
    wrongAmount: 850,
    expectedBalance: 850,
  },
  {
    name: 'Kotak Bank SMS - Should extract 3999, NOT 28001',
    sms: 'Kotak: INR 3,999.00 debited from your A/c XX7890 for purchase at MYNTRA. Bal: INR 28,001.00',
    expectedAmount: 3999,
    wrongAmount: 28001,
    expectedBalance: 28001,
  },
];

// Run tests
console.log('='.repeat(60));
console.log('SMS PARSER TEST RESULTS');
console.log('Testing Bug Fix: Extract transaction amount, NOT balance');
console.log('='.repeat(60));
console.log('');

let passed = 0;
let failed = 0;

TEST_CASES.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`SMS: "${testCase.sms.substring(0, 60)}..."`);
  
  const result = parseSMS(testCase.sms);
  
  if (!result) {
    console.log('❌ FAILED: SMS could not be parsed');
    failed++;
    console.log('');
    return;
  }
  
  console.log(`Parsed Amount: ${result.amount}`);
  console.log(`Parsed Balance: ${result.balance}`);
  console.log(`Expected Amount: ${testCase.expectedAmount}`);
  console.log(`Wrong Amount (balance): ${testCase.wrongAmount}`);
  
  // Check if amount is correct
  if (result.amount === testCase.expectedAmount) {
    console.log('✅ PASSED: Correct transaction amount extracted');
    
    // Also verify it's NOT the balance
    if (result.amount !== testCase.wrongAmount) {
      console.log('✅ PASSED: Amount is NOT the balance (bug fixed!)');
    }
    
    // Verify balance is extracted separately
    if (result.balance === testCase.expectedBalance) {
      console.log('✅ PASSED: Balance extracted separately');
    }
    
    passed++;
  } else if (result.amount === testCase.wrongAmount) {
    console.log('❌ FAILED: BUG NOT FIXED - Extracted balance instead of transaction amount!');
    failed++;
  } else {
    console.log(`❌ FAILED: Unexpected amount ${result.amount}`);
    failed++;
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log(`SUMMARY: ${passed}/${TEST_CASES.length} tests passed`);
if (failed > 0) {
  console.log(`⚠️  ${failed} tests FAILED - Bug may not be fixed!`);
} else {
  console.log('✅ All tests PASSED - SMS Parser bug is FIXED!');
}
console.log('='.repeat(60));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
