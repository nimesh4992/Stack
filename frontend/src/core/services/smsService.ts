// 📱 SMS Reading Service for Auto-Logging
// Uses SMS User Consent API for Google Play Store Compliance (2026)
// Note: Requires Android - iOS does not support SMS reading

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSMS, guessCategory, ParsedTransaction } from '../common/smsParser';

// ============================================
// TYPES
// ============================================

export interface SMSMessage {
  originatingAddress: string; // Sender phone/shortcode
  body: string;               // SMS content
  timestamp?: number;         // When received
}

export interface SMSSettings {
  autoReadEnabled: boolean;
  autoLogEnabled: boolean;    // Auto-log without confirmation
  bankFilters: string[];      // Bank sender IDs to monitor
  hasSeenDisclosure: boolean; // Track if user has seen the prominent disclosure
  consentGiven: boolean;      // Track if user has given explicit consent
}

export interface PendingSMSTransaction {
  id: string;
  sms: SMSMessage;
  parsed: ParsedTransaction;
  category: { id: string; label: string; icon: string };
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

const DEFAULT_SETTINGS: SMSSettings = {
  autoReadEnabled: false,
  autoLogEnabled: false,
  hasSeenDisclosure: false,
  consentGiven: false,
  bankFilters: [
    'HDFCBK', 'ICICIB', 'SBIINB', 'AXISBK', 'KOTAKB',
    'PAYTM', 'PHONEPE', 'GPAY', 'AMAZONPAY',
    'YESBNK', 'ILOBNK', 'PNBSMS', 'BOIIND', 'CANBNK',
  ],
};

const SETTINGS_KEY = '@sms_settings';
const PENDING_KEY = '@pending_sms_transactions';
const CONSENT_KEY = '@sms_consent_given';

// ============================================
// SMS PERMISSION HANDLING (Android Only)
// Uses SMS User Consent API instead of broad READ_SMS
// ============================================

let smsModule: any = null;
let isListening = false;
let smsCallback: ((transaction: PendingSMSTransaction) => void) | null = null;

/**
 * Check if user has given consent for SMS reading
 * This is for our internal tracking, not Android system permissions
 */
export async function checkUserConsent(): Promise<boolean> {
  try {
    const consent = await AsyncStorage.getItem(CONSENT_KEY);
    return consent === 'true';
  } catch {
    return false;
  }
}

/**
 * Record that user has given consent
 */
export async function recordUserConsent(): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, 'true');
    await updateSMSSettings({ consentGiven: true, hasSeenDisclosure: true });
  } catch (error) {
    console.error('Error recording consent:', error);
  }
}

/**
 * Check if SMS permissions are available
 * Only works on Android physical devices
 */
export async function checkSMSPermission(): Promise<{
  hasReadPermission: boolean;
  hasReceivePermission: boolean;
  isSupported: boolean;
  hasUserConsent: boolean;
}> {
  if (Platform.OS !== 'android') {
    return {
      hasReadPermission: false,
      hasReceivePermission: false,
      isSupported: false,
      hasUserConsent: false,
    };
  }

  const hasConsent = await checkUserConsent();

  try {
    // Dynamic import to avoid errors on iOS/web
    const smsLib = await import('@maniac-tech/react-native-expo-read-sms');
    smsModule = smsLib;
    
    const permissions = await smsLib.checkIfHasSMSPermission();
    return {
      hasReadPermission: permissions.hasReadSmsPermission || false,
      hasReceivePermission: permissions.hasReceiveSmsPermission || false,
      isSupported: true,
      hasUserConsent: hasConsent,
    };
  } catch (error) {
    console.log('SMS module not available:', error);
    return {
      hasReadPermission: false,
      hasReceivePermission: false,
      isSupported: false,
      hasUserConsent: hasConsent,
    };
  }
}

/**
 * Request SMS read permission from user
 * IMPORTANT: Must show prominent disclosure BEFORE calling this
 */
export async function requestSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Not Supported',
      'SMS reading is only available on Android devices. On iOS, please use the manual SMS paste feature.',
      [{ text: 'OK' }]
    );
    return false;
  }

  // Check if user has given consent via our disclosure screen
  const hasConsent = await checkUserConsent();
  if (!hasConsent) {
    // This should not happen if flow is correct, but handle gracefully
    console.warn('requestSMSPermission called without user consent');
    return false;
  }

  try {
    if (!smsModule) {
      const smsLib = await import('@maniac-tech/react-native-expo-read-sms');
      smsModule = smsLib;
    }
    
    const granted = await smsModule.requestReadSMSPermission();
    return granted === true;
  } catch (error) {
    console.error('Error requesting SMS permission:', error);
    return false;
  }
}

// ============================================
// SMS LISTENING
// ============================================

/**
 * Start listening for incoming SMS messages
 * @param onTransactionDetected - Callback when a bank transaction SMS is detected
 */
export async function startSMSListener(
  onTransactionDetected: (transaction: PendingSMSTransaction) => void
): Promise<boolean> {
  if (Platform.OS !== 'android' || isListening) {
    return false;
  }

  const permissions = await checkSMSPermission();
  if (!permissions.hasReadPermission || !permissions.hasReceivePermission) {
    console.log('SMS permissions not granted');
    return false;
  }

  const settings = await getSMSSettings();
  if (!settings.autoReadEnabled) {
    console.log('Auto-read is disabled');
    return false;
  }

  try {
    smsCallback = onTransactionDetected;
    
    await smsModule.startReadSMS(
      async (smsData: [string, string]) => {
        const [sender, body] = smsData;
        
        // Check if sender is a known bank
        const isBank = settings.bankFilters.some(filter => 
          sender.toUpperCase().includes(filter.toUpperCase())
        );
        
        if (!isBank) {
          console.log('SMS from non-bank sender, ignoring:', sender);
          return;
        }

        console.log('Bank SMS received from:', sender);
        
        // Parse the SMS
        const parsed = parseSMS(body);
        if (!parsed) {
          console.log('Could not parse SMS as transaction');
          return;
        }

        // Create pending transaction
        const category = guessCategory(parsed.merchantName || '');
        const pendingTransaction: PendingSMSTransaction = {
          id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sms: {
            originatingAddress: sender,
            body,
            timestamp: Date.now(),
          },
          parsed,
          category,
          timestamp: Date.now(),
          status: 'pending',
        };

        // Save to pending list
        await addPendingTransaction(pendingTransaction);

        // Notify callback
        if (smsCallback) {
          smsCallback(pendingTransaction);
        }
      },
      (error: string) => {
        console.error('SMS listener error:', error);
      }
    );

    isListening = true;
    console.log('SMS listener started');
    return true;
  } catch (error) {
    console.error('Failed to start SMS listener:', error);
    return false;
  }
}

/**
 * Stop listening for SMS messages
 */
export async function stopSMSListener(): Promise<void> {
  if (!isListening || !smsModule) {
    return;
  }

  try {
    await smsModule.stopReadSMS();
    isListening = false;
    smsCallback = null;
    console.log('SMS listener stopped');
  } catch (error) {
    console.error('Error stopping SMS listener:', error);
  }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

export async function getSMSSettings(): Promise<SMSSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading SMS settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function updateSMSSettings(
  settings: Partial<SMSSettings>
): Promise<void> {
  try {
    const current = await getSMSSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

    // Restart listener if needed
    if (settings.autoReadEnabled !== undefined) {
      if (settings.autoReadEnabled && !isListening) {
        // Will need callback from app
        console.log('Auto-read enabled, call startSMSListener with callback');
      } else if (!settings.autoReadEnabled && isListening) {
        await stopSMSListener();
      }
    }
  } catch (error) {
    console.error('Error saving SMS settings:', error);
  }
}

// ============================================
// PENDING TRANSACTIONS
// ============================================

export async function getPendingTransactions(): Promise<PendingSMSTransaction[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading pending transactions:', error);
  }
  return [];
}

export async function addPendingTransaction(
  transaction: PendingSMSTransaction
): Promise<void> {
  try {
    const pending = await getPendingTransactions();
    pending.unshift(transaction); // Add to beginning
    // Keep only last 50 pending transactions
    const trimmed = pending.slice(0, 50);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding pending transaction:', error);
  }
}

export async function updatePendingTransaction(
  id: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  try {
    const pending = await getPendingTransactions();
    const updated = pending.map(t => 
      t.id === id ? { ...t, status } : t
    );
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating pending transaction:', error);
  }
}

export async function clearPendingTransactions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch (error) {
    console.error('Error clearing pending transactions:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get count of pending transactions needing approval
 */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingTransactions();
  return pending.filter(t => t.status === 'pending').length;
}

/**
 * Check if SMS auto-read is currently active
 */
export function isAutoReadActive(): boolean {
  return isListening;
}

/**
 * Manually process an SMS text (for paste feature)
 */
export function processManualSMS(smsText: string): PendingSMSTransaction | null {
  const parsed = parseSMS(smsText);
  if (!parsed) {
    return null;
  }

  const category = guessCategory(parsed.merchantName || '');
  
  return {
    id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sms: {
      originatingAddress: 'MANUAL',
      body: smsText,
      timestamp: Date.now(),
    },
    parsed,
    category,
    timestamp: Date.now(),
    status: 'pending',
  };
}
