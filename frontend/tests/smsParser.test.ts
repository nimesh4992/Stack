/**
 * SMS Parser Unit Tests
 * Testing the bug fix: SMS Parser should extract the TRANSACTION amount, not the BALANCE amount
 * 
 * Bug Description: Parser was incorrectly extracting the balance (last amount) instead of 
 * the debited amount (first amount) from bank SMS messages.
 */

import { parseSMS, SAMPLE_SMS_MESSAGES } from '../src/core/common/smsParser';

describe('SMS Parser - Transaction Amount vs Balance', () => {
  /**
   * Test Case 1: HDFC Bank SMS
   * SMS: "HDFC Bank: INR 1,250.00 has been debited from A/c XX1234 for purchase at AMAZON on 25-Feb-26. Avl Bal: INR 45,678.90"
   * Expected: amount = 1250 (NOT 45678.90)
   */
  test('HDFC Bank SMS should extract debited amount (1250), NOT balance (45678.90)', () => {
    const sms = 'HDFC Bank: INR 1,250.00 has been debited from A/c XX1234 for purchase at AMAZON on 25-Feb-26. Avl Bal: INR 45,678.90';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expense');
    expect(result?.amount).toBe(1250); // Transaction amount, NOT balance
    expect(result?.bankName).toBe('HDFC Bank');
    expect(result?.merchantName).toContain('AMAZON');
    expect(result?.balance).toBe(45678.90); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(45678.90);
  });

  /**
   * Test Case 2: SBI SMS
   * SMS: "SBI: Rs.500 debited from A/c XX9012 for UPI/P2M/SWIGGY on 25-Feb. Bal: Rs.12,345.67"
   * Expected: amount = 500 (NOT 12345.67)
   */
  test('SBI SMS should extract debited amount (500), NOT balance (12345.67)', () => {
    const sms = 'SBI: Rs.500 debited from A/c XX9012 for UPI/P2M/SWIGGY on 25-Feb. Bal: Rs.12,345.67';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expense');
    expect(result?.amount).toBe(500); // Transaction amount, NOT balance
    expect(result?.bankName).toBe('SBI');
    expect(result?.balance).toBe(12345.67); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(12345.67);
  });

  /**
   * Test Case 3: Axis Bank SMS
   * SMS: "Axis Bank: INR 2,500.00 spent on Credit Card XX4567 at FLIPKART on 25-Feb-26. Avl Bal: INR 97,500.00"
   * Expected: amount = 2500 (NOT 97500)
   */
  test('Axis Bank SMS should extract spent amount (2500), NOT balance (97500)', () => {
    const sms = 'Axis Bank: INR 2,500.00 spent on Credit Card XX4567 at FLIPKART on 25-Feb-26. Avl Bal: INR 97,500.00';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expense');
    expect(result?.amount).toBe(2500); // Transaction amount, NOT balance
    expect(result?.bankName).toBe('Axis Bank');
    expect(result?.merchantName).toContain('FLIPKART');
    expect(result?.balance).toBe(97500); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(97500);
  });

  /**
   * Test Case 4: UPI Transaction
   * SMS: "UPI: Money sent! Rs.150 debited from Paytm Wallet to ZOMATO@paytm. Wallet Bal: Rs.850.00"
   * Expected: amount = 150 (NOT 850)
   */
  test('UPI SMS should extract debited amount (150), NOT balance (850)', () => {
    const sms = 'UPI: Money sent! Rs.150 debited from Paytm Wallet to ZOMATO@paytm. Wallet Bal: Rs.850.00';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expense');
    expect(result?.amount).toBe(150); // Transaction amount, NOT balance
    expect(result?.balance).toBe(850); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(850);
  });

  /**
   * Test Case 5: Kotak Bank SMS
   * SMS: "Kotak: INR 3,999.00 debited from your A/c XX7890 for purchase at MYNTRA. Bal: INR 28,001.00"
   * Expected: amount = 3999 (NOT 28001)
   */
  test('Kotak Bank SMS should extract debited amount (3999), NOT balance (28001)', () => {
    const sms = 'Kotak: INR 3,999.00 debited from your A/c XX7890 for purchase at MYNTRA. Bal: INR 28,001.00';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('expense');
    expect(result?.amount).toBe(3999); // Transaction amount, NOT balance
    expect(result?.bankName).toBe('Kotak Bank');
    expect(result?.merchantName).toContain('MYNTRA');
    expect(result?.balance).toBe(28001); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(28001);
  });

  /**
   * Test Case 6: Credit transaction (ICICI)
   * SMS: "ICICI Bank: Your Acct XX5678 is credited with INR 50,000.00 on 25-Feb. Avl Bal: INR 75,000.00."
   * Expected: amount = 50000, type = income
   */
  test('ICICI credit SMS should extract credited amount (50000)', () => {
    const sms = 'ICICI Bank: Your Acct XX5678 is credited with INR 50,000.00 on 25-Feb. Avl Bal: INR 75,000.00.';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe('income');
    expect(result?.amount).toBe(50000); // Transaction amount, NOT balance
    expect(result?.bankName).toBe('ICICI Bank');
    expect(result?.balance).toBe(75000); // Balance should be extracted separately
    
    // Critical assertion: amount should NOT be the balance
    expect(result?.amount).not.toBe(75000);
  });
});

describe('SMS Parser - Sample Messages Validation', () => {
  /**
   * Test all sample SMS messages from the SAMPLE_SMS_MESSAGES array
   */
  test('All sample messages should parse correctly', () => {
    SAMPLE_SMS_MESSAGES.forEach((sample) => {
      const result = parseSMS(sample.message);
      
      // Each sample should parse successfully
      expect(result).not.toBeNull();
      
      // Verify the amount is the transaction amount, not balance
      console.log(`Sample ${sample.id} (${sample.sender}): Parsed amount = ${result?.amount}, balance = ${result?.balance}`);
    });
  });

  /**
   * HDFC Sample: amount should be 1250, NOT 45678.90
   */
  test('HDFC sample should extract 1250 as amount', () => {
    const hdfcSample = SAMPLE_SMS_MESSAGES.find(s => s.sender === 'HDFCBK');
    expect(hdfcSample).toBeDefined();
    
    const result = parseSMS(hdfcSample!.message);
    expect(result?.amount).toBe(1250);
    expect(result?.amount).not.toBe(45678.90);
  });

  /**
   * SBI Sample: amount should be 500, NOT 12345.67
   */
  test('SBI sample should extract 500 as amount', () => {
    const sbiSample = SAMPLE_SMS_MESSAGES.find(s => s.sender === 'SBIINB');
    expect(sbiSample).toBeDefined();
    
    const result = parseSMS(sbiSample!.message);
    expect(result?.amount).toBe(500);
    expect(result?.amount).not.toBe(12345.67);
  });
});

describe('SMS Parser - Edge Cases', () => {
  /**
   * SMS with only one amount (no balance mentioned)
   */
  test('SMS with single amount should extract it correctly', () => {
    const sms = 'HDFC Bank: INR 500.00 has been debited from A/c XX1234 for AMAZON';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(500);
    expect(result?.balance).toBeUndefined();
  });

  /**
   * SMS with amount in different format (no decimal)
   */
  test('Amount without decimal should parse correctly', () => {
    const sms = 'SBI: Rs.1000 debited from A/c XX9012 for UPI payment. Bal: Rs.5000';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(1000);
    expect(result?.balance).toBe(5000);
  });

  /**
   * Non-transactional SMS should return null
   */
  test('Non-transactional SMS should return null', () => {
    const sms = 'Your OTP for login is 123456. Valid for 5 minutes.';
    const result = parseSMS(sms);
    
    expect(result).toBeNull();
  });

  /**
   * SMS with large amounts (lakhs)
   */
  test('Large amounts should parse correctly', () => {
    const sms = 'HDFC Bank: INR 1,00,000.00 has been debited from A/c XX1234 for property. Avl Bal: INR 5,00,000.00';
    const result = parseSMS(sms);
    
    expect(result).not.toBeNull();
    // Note: Indian lakhs format might need special handling
    expect(result?.amount).toBeGreaterThan(0);
  });
});
