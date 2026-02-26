# Google Play Console Data Safety Section Template

Use this template to fill out the Data Safety section in Google Play Console for HabitFinance (Stack).

---

## Data Types Collected

### ☑️ Financial Info
**Type:** Financial info > Purchase history  
**Collected:** Yes  
**Shared:** No  
**Purpose:** App functionality  
**Optional:** Yes (user can use app without SMS feature)

**Details to enter:**
- This data is collected from user's device (SMS messages)
- Data is processed on-device only
- Data is not transferred off the device
- Data can be deleted by user (Settings > Clear All Data)

---

## Data Collection Details

### Question: Does your app collect any of these data types?

| Data Type | Collected? | Notes |
|-----------|------------|-------|
| Personal info (Name) | Yes | User enters name during onboarding |
| Financial info | Yes | Transaction amounts from SMS |
| Messages (SMS) | Yes | Only bank transaction SMS, processed locally |
| App activity | No | No analytics collected |
| App info and performance | No | No crash logs sent |
| Device or other IDs | No | No device IDs collected |

---

## Data Sharing Details

### Question: Does your app share any data with third parties?

**Answer:** No

**Explanation:** All financial data remains on the user's device. No data is transmitted to our servers or any third parties.

---

## Data Handling Practices

### Question: Is data encrypted in transit?
**Answer:** N/A - No data is transmitted

### Question: Can users request data deletion?
**Answer:** Yes
**How:** Settings > Clear All Data (deletes all data permanently)

### Question: Is this data collection required?
**Answer:** No - SMS auto-detection is optional. Users can add transactions manually.

---

## Security Practices

### Question: Is data encrypted?
**Answer:** Yes - Data is stored using device-level encryption via AsyncStorage and SecureStore.

### Question: Does your app follow Google's User Data policy?
**Answer:** Yes

---

## Prominent Disclosure Verification

### Question: Does your app show a prominent disclosure before collecting sensitive data?
**Answer:** Yes

**Implementation Details:**
- Full-screen disclosure modal (`SMSConsentDisclosure.tsx`)
- Shown before any SMS permission request
- User must scroll to bottom to enable Accept button
- Clear explanation of what data is collected and why
- Option to decline without affecting core app functionality

---

## Sample Responses for Google Play Review Team

### If asked about SMS usage:

> "HabitFinance uses SMS reading solely to detect bank transaction alerts and automatically log expenses. All SMS processing happens 100% on-device - no message content is ever transmitted to any server. Users see a prominent disclosure screen before any SMS permission is requested, and the feature is entirely optional. Users can always add transactions manually or disable SMS reading at any time in Settings."

### If asked about data retention:

> "Financial transaction data is stored only on the user's device using encrypted storage. When the user uninstalls the app or uses the 'Clear All Data' option in Settings, all data is permanently deleted. We have no server-side storage of any user data."

### If asked about third-party sharing:

> "We do not share any user data with third parties. The only third-party service integrated is Google AdMob for displaying ads, but we do not share financial or SMS data with the advertising network."

---

## Checklist Before Submission

- [ ] Data safety form completed in Play Console
- [ ] Privacy policy URL added to store listing
- [ ] Prominent disclosure implemented in app
- [ ] SMS permissions removed from manifest (using User Consent API)
- [ ] "Financial features" declaration completed
- [ ] Demo video prepared (if required)

---

*Last Updated: August 2025*
