// 📱 SMS Import Screen - Parse Bank SMS Messages
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../src/store';
import { addTransaction } from '../src/features/expenseTracking/expenseSlice';
import { awardPoints, updateStreak } from '../src/features/gamification/gamificationSlice';
import { 
  selectPreferences, 
  markSmsTourSeen,
  updatePreferences,
  saveUserPreferences 
} from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { SMSTour } from '../src/core/presentation/components/SMSTour';
import { parseSMS, SAMPLE_SMS_MESSAGES, guessCategory, ParsedTransaction } from '../src/core/common/smsParser';
import { checkSMSPermission, requestSMSPermission } from '../src/core/services/smsService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  POINTS,
} from '../src/core/common/constants';

export default function SMSImportScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectPreferences);
  
  const [customSMS, setCustomSMS] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedTransaction | null>(null);
  const [selectedSMS, setSelectedSMS] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [smsPermissionStatus, setSmsPermissionStatus] = useState<{
    hasRead: boolean;
    hasReceive: boolean;
    isSupported: boolean;
  }>({ hasRead: false, hasReceive: false, isSupported: false });
  
  // Show tour on first visit
  useEffect(() => {
    if (!preferences.hasSeenSmsTour) {
      setShowTour(true);
    }
  }, [preferences.hasSeenSmsTour]);
  
  // Check SMS permissions on mount
  useEffect(() => {
    checkSMSPermission().then(status => {
      setSmsPermissionStatus({
        hasRead: status.hasReadPermission,
        hasReceive: status.hasReceivePermission,
        isSupported: status.isSupported,
      });
    });
  }, []);
  
  const handleTourComplete = () => {
    setShowTour(false);
    dispatch(markSmsTourSeen());
    dispatch(saveUserPreferences({
      ...preferences,
      hasSeenSmsTour: true,
    }));
  };
  
  const handleRequestPermission = async () => {
    const granted = await requestSMSPermission();
    if (granted) {
      setSmsPermissionStatus(prev => ({
        ...prev,
        hasRead: true,
        hasReceive: true,
      }));
      Alert.alert('Permission Granted!', 'SMS auto-detection is now enabled.');
    } else {
      Alert.alert('Permission Denied', 'You can still paste SMS manually.');
    }
  };
  
  const handleToggleAutoLog = async (value: boolean) => {
    const updated = {
      ...preferences,
      smsAutoLogEnabled: value,
    };
    dispatch(updatePreferences({ smsAutoLogEnabled: value }));
    dispatch(saveUserPreferences(updated));
  };

  const handleParseSMS = (sms: string) => {
    const result = parseSMS(sms);
    setParsedResult(result);
    setSelectedSMS(sms);
    
    if (!result) {
      Alert.alert('Parse Failed', 'Could not extract transaction details from this SMS. Try a different format.');
    }
  };

  const handleImportTransaction = async () => {
    if (!parsedResult) return;
    
    const category = guessCategory(parsedResult.merchantName || '');
    
    try {
      await dispatch(
        addTransaction({
          type: parsedResult.type,
          amount: parsedResult.amount,
          categoryId: category.id,
          categoryLabel: category.label,
          categoryIcon: category.icon,
          date: parsedResult.date,
          source: 'sms',
          merchantName: parsedResult.merchantName,
          bankName: parsedResult.bankName,
        })
      ).unwrap();
      
      await dispatch(awardPoints(POINTS.LOG_EXPENSE));
      await dispatch(updateStreak());
      
      Alert.alert(
        'Success! 🎉',
        `${parsedResult.type === 'expense' ? 'Expense' : 'Income'} of ₹${parsedResult.amount.toLocaleString()} imported!`,
        [{ text: 'OK', onPress: () => {
          setParsedResult(null);
          setSelectedSMS(null);
          setCustomSMS('');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to import transaction');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SMS Tour Overlay */}
      <SMSTour visible={showTour} onComplete={handleTourComplete} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMS Import</Text>
        <TouchableOpacity onPress={() => setShowTour(true)} style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Permission & Auto-Log Settings */}
        {Platform.OS === 'android' && (
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark" size={24} color={smsPermissionStatus.hasRead ? COLORS.success : COLORS.textTertiary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>SMS Permission</Text>
                  <Text style={styles.settingSubtitle}>
                    {smsPermissionStatus.hasRead ? 'Granted - Auto-detect enabled' : 'Required for auto-detection'}
                  </Text>
                </View>
              </View>
              {!smsPermissionStatus.hasRead && (
                <TouchableOpacity style={styles.grantButton} onPress={handleRequestPermission}>
                  <Text style={styles.grantButtonText}>Grant</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="flash" size={24} color={preferences.smsAutoLogEnabled ? COLORS.habitOrange : COLORS.textTertiary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Auto-Log Transactions</Text>
                  <Text style={styles.settingSubtitle}>
                    {preferences.smsAutoLogEnabled ? 'Log without confirmation' : 'Confirm each transaction'}
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.smsAutoLogEnabled}
                onValueChange={handleToggleAutoLog}
                trackColor={{ false: COLORS.border, true: COLORS.habitOrange + '50' }}
                thumbColor={preferences.smsAutoLogEnabled ? COLORS.habitOrange : COLORS.textTertiary}
              />
            </View>
          </Card>
        )}
        
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Auto-Parse Bank SMS</Text>
            <Text style={styles.infoText}>
              Paste your bank transaction SMS or tap a sample message below to automatically extract transaction details.
            </Text>
          </View>
        </Card>

        {/* Custom SMS Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PASTE YOUR SMS</Text>
          <Card style={styles.inputCard}>
            <TextInput
              style={styles.smsInput}
              placeholder="Paste bank SMS here..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              value={customSMS}
              onChangeText={setCustomSMS}
            />
            <TouchableOpacity
              style={[styles.parseButton, !customSMS && styles.parseButtonDisabled]}
              onPress={() => handleParseSMS(customSMS)}
              disabled={!customSMS}
            >
              <Ionicons name="scan" size={20} color="#FFFFFF" />
              <Text style={styles.parseButtonText}>Parse SMS</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Parsed Result */}
        {parsedResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PARSED RESULT</Text>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[
                  styles.resultTypeIcon,
                  { backgroundColor: parsedResult.type === 'expense' ? COLORS.danger + '20' : COLORS.success + '20' }
                ]}>
                  <Ionicons
                    name={parsedResult.type === 'expense' ? 'arrow-down' : 'arrow-up'}
                    size={24}
                    color={parsedResult.type === 'expense' ? COLORS.danger : COLORS.success}
                  />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultType}>
                    {parsedResult.type === 'expense' ? 'Expense' : 'Income'}
                  </Text>
                  <Text style={styles.resultBank}>{parsedResult.bankName}</Text>
                </View>
                <Text style={[
                  styles.resultAmount,
                  { color: parsedResult.type === 'expense' ? COLORS.danger : COLORS.success }
                ]}>
                  {parsedResult.type === 'expense' ? '-' : '+'}₹{parsedResult.amount.toLocaleString()}
                </Text>
              </View>
              
              {parsedResult.merchantName && (
                <View style={styles.resultDetail}>
                  <Ionicons name="storefront-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.resultDetailText}>{parsedResult.merchantName}</Text>
                </View>
              )}
              
              {parsedResult.accountLast4 && (
                <View style={styles.resultDetail}>
                  <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.resultDetailText}>Account: ****{parsedResult.accountLast4}</Text>
                </View>
              )}
              
              {parsedResult.balance !== undefined && (
                <View style={styles.resultDetail}>
                  <Ionicons name="wallet-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.resultDetailText}>Balance: ₹{parsedResult.balance.toLocaleString()}</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.importButton} onPress={handleImportTransaction}>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.importButtonText}>Import Transaction</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Sample SMS Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAMPLE MESSAGES (TAP TO PARSE)</Text>
          <View style={styles.sampleList}>
            {SAMPLE_SMS_MESSAGES.map((sms) => (
              <TouchableOpacity
                key={sms.id}
                onPress={() => {
                  setCustomSMS(sms.message);
                  handleParseSMS(sms.message);
                }}
              >
                <Card style={[
                  styles.sampleCard,
                  selectedSMS === sms.message && styles.sampleCardSelected
                ]}>
                  <View style={styles.sampleHeader}>
                    <View style={styles.sampleSender}>
                      <Ionicons name="chatbubble" size={14} color={COLORS.primary} />
                      <Text style={styles.sampleSenderText}>{sms.sender}</Text>
                    </View>
                    {selectedSMS === sms.message && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    )}
                  </View>
                  <Text style={styles.sampleMessage} numberOfLines={3}>
                    {sms.message}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Supported Banks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORTED BANKS</Text>
          <Card style={styles.banksCard}>
            <View style={styles.banksList}>
              {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'UPI'].map((bank) => (
                <View key={bank} style={styles.bankBadge}>
                  <Text style={styles.bankBadgeText}>{bank}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.banksNote}>
              Works with most Indian bank SMS formats. Generic patterns support other banks too.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
    borderWidth: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  settingsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  grantButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  inputCard: {
    padding: SPACING.lg,
  },
  smsInput: {
    minHeight: 100,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  parseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  parseButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  parseButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  resultCard: {
    padding: SPACING.lg,
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultType: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  resultBank: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  resultAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  resultDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  resultDetailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  importButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  sampleList: {
    gap: SPACING.md,
  },
  sampleCard: {
    padding: SPACING.md,
  },
  sampleCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '05',
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sampleSender: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sampleSenderText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  sampleMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  banksCard: {
    padding: SPACING.lg,
  },
  banksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bankBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.full,
  },
  bankBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  banksNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
