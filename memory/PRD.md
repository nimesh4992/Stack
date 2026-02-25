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
- **SMS Parsing**: Auto-extract transactions from Indian bank SMS (HDFC, ICICI, SBI, Axis, Kotak, UPI) - BUG FIXED
- **Smart Nudge Engine**: Contextual, witty, motivational messages based on user behavior
- **Challenges & Goals**: Track financial challenges and savings goals
- **Settings**: Toggles for notifications, SMS permissions, dark mode

### NEW Features (Dec 25, 2025)
- **Personalized Greetings**: Time-based greetings (Good Morning/Afternoon/Evening, [Name]!)
- **Companion Avatars**: 6 characters to choose from:
  - 🐻 Teddy (Warm & Encouraging)
  - 🐱 Whiskers (Witty & Playful)  
  - 🤖 Sparky (Smart & Analytical)
  - 🐼 Bamboo (Calm & Wise)
  - 🦊 Rusty (Clever & Resourceful)
  - 🦉 Sage (Thoughtful & Knowledgeable)
- **Choose Companion Screen**: Set name and select companion avatar
- **SMS Tour**: 3-step overlay tutorial explaining SMS import feature
- **Smart Notifications**: Pattern-based notification scheduling that learns user behavior
- **AdMob Integration**: Smart ad placement with daily limits (simulated on web)
- **Post-Log Nudge Toast**: Animated toast showing contextual message after logging expense

### In Progress / Mocked
- **Local Notifications**: Service ready with pattern-based scheduling, awaits native testing
- **Real SMS Reading**: Android permissions configured, UI ready

### Future / Backlog
- Functional Dark Mode implementation
- Data Export/Backup to CSV/JSON
- Educational Micro-lessons
- Invite friends feature

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
├── app/                           # Screens (expo-router)
│   ├── home.tsx                   # Home with personalized greeting + companion
│   ├── add-expense.tsx            # Quick log with post-log nudge toast
│   ├── challenges.tsx             # Challenges & Goals
│   ├── choose-companion.tsx       # NEW: Companion selection screen
│   ├── sms-import.tsx             # SMS parsing with tour overlay
│   ├── settings.tsx               # App settings
│   └── ...
├── src/
│   ├── core/
│   │   ├── common/
│   │   │   ├── companions.ts      # NEW: Companion definitions & greeting logic
│   │   │   ├── smsParser.ts       # SMS parsing logic (FIXED)
│   │   │   ├── nudgeEngine.ts     # Smart nudge logic
│   │   │   └── constants.ts       # Colors, spacing, categories
│   │   ├── services/
│   │   │   ├── adService.ts       # AdMob trigger & tracking
│   │   │   ├── notificationService.ts # Smart notification scheduling
│   │   │   └── smsService.ts      # SMS permission handling
│   │   └── presentation/
│   │       └── components/
│   │           ├── CompanionAvatar.tsx  # NEW: Avatar component
│   │           ├── SMSTour.tsx          # NEW: 3-step tutorial overlay
│   │           ├── NudgeCard.tsx        # Nudge display
│   │           └── CircularProgress.tsx # Progress rings
│   └── features/
│       ├── expenseTracking/
│       ├── gamification/
│       ├── onboarding/
│       └── userPreferences/       # NEW: User preferences state
│           └── userPreferencesSlice.ts
```

## Recent Changes (Dec 25, 2025)

### New Features
1. **Personalized Greetings with Companion Avatars**
   - Time-based greeting: Good Morning/Afternoon/Evening/Night
   - 6 companion characters with unique personalities
   - Contextual messages based on time of day
   - Tappable header to access profile settings

2. **SMS Tour Overlay**
   - 3-step tutorial explaining SMS import
   - Step 1: Auto-Detect Bank SMS
   - Step 2: Your Data Stays Private
   - Step 3: You Control Everything
   - Skip button, progress dots, Next/Got It buttons

3. **Smart Notification Scheduling**
   - Pattern-based timing that learns user behavior
   - Tracks app open times for optimal notification delivery
   - Challenge reminders and streak notifications
   - Invite friends nudges

4. **User Preferences System**
   - New Redux slice for managing preferences
   - Display name and companion selection
   - Notification settings persistence
   - SMS auto-log preference

### Bug Fixes
1. **SMS Parser**: Fixed regex to extract transaction amount (not balance)
2. **Goals Tab Icons**: Changed from Ionicons names to emojis
3. **Tab Switcher**: Added border styling for better visual feedback

## Test Results (Latest)
- **Frontend Tests**: 100% pass rate
- **Personalization Tests**: All passed
- **SMS Tour Tests**: All 8 tests passed
- **Settings Tests**: All 7 tests passed

## Known Limitations
- AdMob only works on native iOS/Android, simulated on web
- Local notifications scheduling works but won't trigger on web
- Lottie animations disabled (using emoji fallback for web compatibility)

## Credentials
- **AdMob App ID**: ca-app-pub-7302439791882329~8253964613
- **AdMob Interstitial**: ca-app-pub-7302439791882329/9857602581
- **AdMob Native**: ca-app-pub-7302439791882329/5675144563

## Next Actions
1. Test on native devices with real notifications and AdMob ads
2. Implement functional Dark Mode toggle logic
3. Implement Data Export/Backup functionality
4. Add Invite Friends sharing feature
