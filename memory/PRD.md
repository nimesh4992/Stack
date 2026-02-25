# HabitFinance - Personal Finance Habit Building App

## Product Overview
A mobile-first personal finance habit-building app built with React Native (Expo). The app is offline-first with all data stored locally on the device.

## Core Features

### Implemented
- **Onboarding Quiz**: Goal selection and personalization
- **Manual Expense Tracking**: Quick log with category selection
- **Gamification**: Streaks, XP, levels, badges, and challenges
- **Insights Dashboard**: Charts and spending analysis (placeholders)
- **Highlights ("Spotify Wrapped")**: Weekly/daily spending summaries
- **SMS Parsing**: Auto-extract transactions from Indian bank SMS (HDFC, ICICI, SBI, Axis, Kotak, UPI)
- **Smart Nudge Engine**: Contextual, witty, motivational messages based on user behavior
- **Challenges & Goals**: Track financial challenges and savings goals
- **Settings**: Toggles for notifications, SMS permissions, dark mode

### In Progress / Mocked
- **AdMob Integration**: Infrastructure in place, ad display logic implemented (simulated on web)
- **Local Notifications**: Service ready, scheduling logic needed
- **Post-Log Nudge Toast**: Shows contextual message after logging expense

### Future / Backlog
- Functional Dark Mode implementation
- Data Export/Backup to CSV/JSON
- Educational Micro-lessons
- Real SMS reading with permissions on native

## Tech Stack
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit + redux-persist + AsyncStorage
- **Navigation**: expo-router
- **UI**: Custom components with StyleSheet.create()
- **Charts**: react-native-gifted-charts (placeholder integration)
- **Monetization**: react-native-google-mobile-ads

## Code Architecture
```
/app/frontend/
├── app/                      # Screens (expo-router)
│   ├── home.tsx              # Home dashboard
│   ├── add-expense.tsx       # Quick log with post-log nudge
│   ├── challenges.tsx        # Challenges & Goals with tab switcher
│   ├── sms-import.tsx        # SMS parsing screen
│   ├── settings.tsx          # App settings
│   └── ...
├── src/
│   ├── core/
│   │   ├── common/
│   │   │   ├── smsParser.ts    # SMS parsing logic (FIXED)
│   │   │   ├── nudgeEngine.ts  # Smart nudge logic
│   │   │   └── constants.ts    # Colors, spacing, categories
│   │   ├── services/
│   │   │   └── adService.ts    # AdMob trigger & tracking
│   │   └── presentation/
│   │       └── components/
│   │           ├── NudgeCard.tsx       # Nudge display
│   │           └── CircularProgress.tsx # Progress rings
│   └── features/
│       ├── expenseTracking/
│       ├── gamification/
│       └── onboarding/
```

## Recent Changes (Dec 25, 2025)

### Bug Fixes
1. **SMS Parser Bug (FIXED)**
   - Issue: Parser was extracting account balance instead of transaction amount
   - Root Cause: Regex patterns were matching the last amount (balance) instead of first (transaction)
   - Fix: Updated regex patterns to specifically match amount followed by debit/credit keywords and stop before balance keywords
   - Tested: All 5 bank formats (HDFC, SBI, Axis, UPI, Kotak) pass

2. **Goals Tab Icons (FIXED)**
   - Issue: Icon names showing as text instead of emojis
   - Fix: Changed goal icons from Ionicons names to emojis

### New Features
1. **AdMob Display Logic**: Implemented smart ad placement with:
   - Daily limits (max 3 interstitial, 5 rewarded)
   - Cooldown between ads (60s minimum)
   - Trigger configurations for different events
   - XP rewards for rewarded ads

2. **Post-Log Nudge Toast**: Added animated toast that appears after logging expense with contextual message from nudge engine

3. **UI Improvements**: Enhanced tab switcher on Challenges screen with border and better visual feedback

## Known Limitations
- AdMob only works on native iOS/Android, simulated on web
- AsyncStorage has web preview limitations
- Some click events don't work perfectly in web preview (native works fine)

## Credentials
- **AdMob App ID**: ca-app-pub-7302439791882329~8253964613
- **AdMob Interstitial**: ca-app-pub-7302439791882329/9857602581
- **AdMob Native**: ca-app-pub-7302439791882329/5675144563

## Next Actions
1. Implement functional Dark Mode toggle logic
2. Implement Data Export/Backup functionality
3. Implement Local Notification scheduling
4. Test on native devices with real AdMob ads
