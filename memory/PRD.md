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
  - Supports: Food, Transport, Shopping, Entertainment, Bills, Health, Groceries
  - Uses keyword matching with fuzzy search (Levenshtein distance)
- **Spending Predictions**: Forecast monthly spending with trend analysis
  - Algorithm: 60% current pace + 40% historical (3 months)
  - 85% confidence with sufficient data
- **Churn Prevention**: Detect at-risk users and recommend re-engagement
  - Risk factors: Inactivity, broken streaks, low engagement, declining opens
  - Risk levels: LOW, MEDIUM, HIGH, CRITICAL
- **Anomaly Detection**: Flag unusual spending patterns
  - Uses z-score and percentage comparison
  - Severity levels: minor, moderate, significant
- **Smart Notification Timing**: Optimal nudge time based on usage patterns
  - Analyzes app open history to find peak usage hours
  - Notifies 30-60 minutes before peak time

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
│   ├── home.tsx                   # Home with personalized greeting
│   ├── add-expense.tsx            # Quick log with anomaly detection
│   ├── ai-insights.tsx            # AI dashboard
│   ├── invite-friends.tsx         # Invite with rewards
│   ├── share-achievement.tsx      # Share on social media
│   ├── choose-companion.tsx       # Companion selection
│   ├── sms-import.tsx             # SMS parsing with tour
│   └── settings.tsx               # Full settings
├── src/
│   ├── core/
│   │   ├── services/
│   │   │   ├── aiEngine.ts        # TensorFlow AI logic
│   │   │   ├── socialService.ts   # Invite & share logic
│   │   │   ├── notificationService.ts
│   │   │   └── adService.ts
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
