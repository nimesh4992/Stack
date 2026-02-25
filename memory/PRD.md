# HabitFinance - Personal Finance Habit Building App

## Product Overview
A mobile-first personal finance habit-building app built with React Native (Expo). The app is offline-first with all data stored locally on the device. Features TensorFlow-powered AI for personalized insights and engagement.

## Core Features

### Implemented
- **Onboarding Quiz**: Goal selection and personalization
- **Manual Expense Tracking**: Quick log with category selection
- **Gamification**: Streaks, XP, levels, badges, and challenges
- **Insights Dashboard**: Charts and spending analysis
- **Highlights ("Spotify Wrapped")**: Weekly/daily spending summaries
- **SMS Parsing**: Auto-extract transactions from Indian bank SMS
- **Smart Nudge Engine**: Contextual, witty, motivational messages
- **Challenges & Goals**: Track financial challenges and savings goals

### Personalization Features
- **Personalized Greetings**: Time-based greetings (Good Morning/Afternoon/Evening, [Name]!)
- **Companion Avatars**: 6 characters (Teddy, Whiskers, Sparky, Bamboo, Rusty, Sage)
- **Daily Companion Messages**: Smart timing based on user patterns
- **SMS Tour**: 3-step overlay tutorial for SMS import

### Social Features
- **Invite Friends with Rewards**: 5 reward tiers (First Referral → Ambassador)
- **Share Achievements**: Share streaks, badges, savings, challenges on social media
- **Native Share Integration**: Works with WhatsApp, Twitter, Instagram, etc.

### AI Features (TensorFlow-Powered)
- **Category Auto-Classification**: Automatically categorize expenses from merchant names
- **Spending Predictions**: Forecast monthly spending with trend analysis
- **Churn Prevention**: Detect at-risk users and recommend re-engagement
- **Anomaly Detection**: Flag unusual spending patterns
- **Smart Notification Timing**: Optimal nudge time based on usage patterns

### New Features (Feb 25, 2026)
- **Security Info Modal**: Clickable SECURE lock badge on home screen opens modal explaining privacy features
- **Enhanced Streak Calendar**: Interactive weekly/monthly calendar view showing logged dates
- **Edit Profile Screen**: Update display name, monthly budget goal, and currency preferences
- **Habits Tracker Screen**: Track daily habits (Steps, Water intake, Mindful minutes) with +/- counters
- **Google Drive Backup**: Backup and restore data to Google Drive (requires development build)
- **FAQs Screen**: 16 frequently asked questions across 6 categories with expandable answers
- **Privacy Policy Screen**: Comprehensive privacy policy with quick summary
- **Help & Support Screen**: Contact form with FAQs, Community, and Twitter links

## Tech Stack
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit + redux-persist + AsyncStorage
- **Navigation**: expo-router
- **AI**: TensorFlow.js + Statistical/Heuristic models
- **Monetization**: react-native-google-mobile-ads
- **Sharing**: React Native Share API

## Code Architecture
```
/app/frontend/
├── app/
│   ├── home.tsx                   # Home with SECURE badge + SecurityInfoModal
│   ├── add-expense.tsx            # Quick log with anomaly detection
│   ├── ai-insights.tsx            # AI dashboard
│   ├── invite-friends.tsx         # Invite with rewards
│   ├── share-achievement.tsx      # Share on social media
│   ├── choose-companion.tsx       # Companion selection
│   ├── sms-import.tsx             # SMS parsing with tour
│   ├── settings.tsx               # Settings with navigation links
│   ├── edit-profile.tsx           # NEW: Edit profile form
│   ├── habits-tracker.tsx         # NEW: Steps/Water/Mindful tracking
│   ├── faqs.tsx                   # NEW: FAQ screen
│   ├── google-drive-backup.tsx    # NEW: Google Drive backup
│   ├── privacy-policy.tsx         # Privacy policy
│   └── help-support.tsx           # Help & support
├── src/
│   ├── core/
│   │   ├── services/
│   │   │   ├── aiEngine.ts        # TensorFlow AI logic
│   │   │   ├── socialService.ts   # Invite & share logic
│   │   │   ├── notificationService.ts
│   │   │   ├── googleDriveService.ts # NEW: Google Drive backup service
│   │   │   └── adService.ts
│   │   ├── presentation/
│   │   │   └── components/
│   │   │       ├── SecurityInfoModal.tsx  # NEW: Security modal
│   │   │       ├── StreakCalendar.tsx     # NEW: Interactive calendar
│   │   │       └── ...
│   │   └── common/
│   │       ├── companions.ts
│   │       ├── smsParser.ts
│   │       └── nudgeEngine.ts
│   └── features/
│       └── userPreferences/
├── eas.json                       # EAS Build config
└── app.json
```

## Test Results (All Iterations)
- **Iteration 1**: SMS Parser - 100% pass (5/5)
- **Iteration 2**: Personalization - 100% pass
- **Iteration 3**: Social Features - 100% pass (19/19)
- **Iteration 4**: AI Features - 100% pass (22/22)
- **Iteration 5**: New Screens (FAQs, Edit Profile, Habits Tracker, Google Drive Backup) - 100% pass (40/40)

## Deployment Instructions

### Build APK with EAS
```bash
# 1. Save code to GitHub (use "Save to Github" button)
# 2. Install EAS CLI
npm install -g eas-cli

# 3. Login to Expo
eas login

# 4. Build APK
cd frontend
eas build --platform android --profile preview

# 5. Download APK from Expo dashboard
```

### Build Production AAB (for Play Store)
```bash
eas build --platform android --profile production
```

## Credentials
- **AdMob App ID**: ca-app-pub-7302439791882329~8253964613
- **AdMob Interstitial**: ca-app-pub-7302439791882329/9857602581
- **AdMob Native**: ca-app-pub-7302439791882329/5675144563

## Privacy
All AI processing happens 100% on-device. User data never leaves the phone.

## Mocked Features
- **Google Drive Backup**: Sign-In is MOCKED because it requires native modules not available in Expo Go/web. Works in development builds.

## Backlog / Future Tasks
- Implement expo-pedometer for automatic step tracking
- Persist habits tracker data to Redux/AsyncStorage
- Add more expense categories
- Implement full Google Drive backup when building with EAS
