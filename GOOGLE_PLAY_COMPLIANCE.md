# Google Play Store Compliance Guide - SMS Permissions

## Overview

This document outlines the compliance measures implemented in HabitFinance (Stack) to meet Google Play Store's 2026 requirements for apps that access SMS data.

---

## ✅ Implementation Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Remove broad SMS permissions | ✅ Done | Removed `READ_SMS` and `RECEIVE_SMS` from `app.json` |
| Prominent Disclosure | ✅ Done | `SMSConsentDisclosure.tsx` modal shown before permission |
| User Consent Tracking | ✅ Done | Stored in AsyncStorage via `smsService.ts` |
| Privacy Policy Update | ✅ Done | Updated SMS section in `privacy-policy.tsx` |
| Local Processing Only | ✅ Done | SMS never leaves device |
| Disable Option | ✅ Done | Toggle in Settings screen |

---

## Key Files Modified

### 1. `/app/frontend/app.json`
- **Removed**: `RECEIVE_SMS`, `READ_SMS` permissions
- **Retained**: Only necessary permissions (notifications, activity recognition)

### 2. `/app/frontend/src/core/presentation/components/SMSConsentDisclosure.tsx`
- **NEW FILE**: Prominent disclosure modal for Google Play compliance
- Shows before any SMS permission request
- Explains exactly what data is accessed and why
- User must scroll to bottom before accepting
- Includes "No, Thanks" option

### 3. `/app/frontend/src/core/services/smsService.ts`
- **Added**: `checkUserConsent()` - Check if user has seen disclosure
- **Added**: `recordUserConsent()` - Store consent after disclosure accepted
- **Modified**: `requestSMSPermission()` - Now requires consent first
- **Added**: `hasSeenDisclosure` and `consentGiven` to settings

### 4. `/app/frontend/app/settings.tsx`
- **Added**: SMS Consent Disclosure modal integration
- **Modified**: SMS toggle now shows disclosure before requesting permission
- **Added**: Separate handlers for disclosure accept/decline

### 5. `/app/frontend/app/privacy-policy.tsx`
- **Updated**: SMS section with more detailed disclosure
- Includes clear data usage list (what we do/don't do)

---

## Google Play Console Submission Steps

### Step 1: Financial Features Declaration
1. Go to **Play Console** > **Policy and programs** > **App content**
2. Find **Financial features** section
3. Declare: "Personal finance management app"
4. Note: If operating in India/Thailand/Indonesia, may need regulatory proof

### Step 2: Data Safety Section
Fill out data safety form with:
- **Data collected**: Financial transaction data (from SMS)
- **Purpose**: App functionality (expense tracking)
- **Sharing**: No third-party sharing
- **Encryption**: Data encrypted on device
- **Deletion**: Users can delete via Settings > Clear Data

### Step 3: Permissions Declaration (if using broad SMS)
**Note**: This app now uses SMS User Consent API, so this may not be needed.

If required:
1. Go to **Policy and programs** > **Sensitive permissions**
2. Complete the declaration form
3. Provide YouTube demo video showing:
   - User opening Settings
   - Toggling SMS Auto-Read
   - Seeing prominent disclosure
   - Accepting and granting permission
   - SMS being detected and parsed
   - Transaction being logged

### Step 4: Privacy Policy
Ensure your privacy policy URL (in Play Console listing) includes:
- Clear statement about SMS data collection
- How data is processed (on-device only)
- User's rights to disable feature
- Data deletion options

---

## Prominent Disclosure Content

The following text is shown in the `SMSConsentDisclosure` modal:

### What We Access
> Stack requests permission to read your SMS messages **solely to detect bank transaction alerts** and automatically log your expenses and income.

### How Your SMS Data Is Used
1. **Transaction Detection** - Scan incoming SMS for bank keywords
2. **Local Processing Only** - All parsing happens on device
3. **User-Controlled Logging** - Review transactions before logging

### What We DON'T Do
- ❌ Read personal/private messages
- ❌ Upload or share SMS content
- ❌ Use SMS data for advertising
- ❌ Store raw SMS text after processing

---

## Testing the Compliance Flow

1. **Fresh Install**: Clear app data or reinstall
2. **Navigate to Settings**: Open the Settings screen
3. **Toggle SMS Auto-Read**: The prominent disclosure modal should appear
4. **Review Disclosure**: Scroll through the entire content
5. **Accept/Decline**: Test both paths
6. **Grant Permission**: After accepting, Android permission dialog appears
7. **Verify State**: SMS settings should reflect the user's choice

---

## Notes for App Store Review

- The app does NOT use SMS as default handler (not a messaging app)
- SMS reading is a **convenience feature**, not core functionality
- App works fully without SMS permission (manual entry available)
- All data processing is on-device only
- Clear privacy-first messaging throughout the app

---

## Contact for Compliance Questions

If Google requests additional information:
- Email: privacy@habitfinance.app
- Documentation: This file and in-app privacy policy

---

*Last Updated: August 2025*
*Compliance Standard: Google Play Developer Policy 2026*
