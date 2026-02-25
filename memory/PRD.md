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
- **SMS Parsing**: Auto-extract transactions from Indian bank SMS - BUG FIXED
- **Smart Nudge Engine**: Contextual, witty, motivational messages
- **Challenges & Goals**: Track financial challenges and savings goals
- **Settings**: Full settings screen with toggles

### Personalization Features (Dec 25, 2025)
- **Personalized Greetings**: Time-based greetings (Good Morning/Afternoon/Evening, [Name]!)
- **Companion Avatars**: 6 characters to choose from:
  - 🐻 Teddy (Warm & Encouraging)
  - 🐱 Whiskers (Witty & Playful)  
  - 🤖 Sparky (Smart & Analytical)
  - 🐼 Bamboo (Calm & Wise)
  - 🦊 Rusty (Clever & Resourceful)
  - 🦉 Sage (Thoughtful & Knowledgeable)
- **SMS Tour**: 3-step overlay tutorial for SMS import

### Social Features (Dec 25, 2025)
- **Invite Friends with Rewards**:
  - Share invite link via native share sheet
  - Track invites sent
  - 5 reward tiers with XP bonuses:
    - 🤝 First Referral (1 invite) - 100 XP
    - 🌟 Social Starter (3 invites) - 250 XP
    - 🦋 Social Butterfly (5 invites) - 500 XP
    - 📢 Influencer (10 invites) - 1000 XP
    - 👑 Ambassador (25 invites) - 2500 XP

- **Share Achievements on Social Media**:
  - Share all achievement types: streaks, badges, savings, challenges, levels, milestones
  - Customized share messages per achievement type
  - Native share sheet integration

- **Daily Companion Messages**:
  - Smart timing based on user's app usage patterns
  - Companion-specific messages for morning, afternoon, evening
  - Contextual suffixes based on streak and budget status

### In Progress / Mocked
- **Local Notifications**: Service ready with smart scheduling, works on native
- **AdMob Integration**: Infrastructure complete, simulated on web
- **Real SMS Reading**: Android permissions configured, UI ready

### Future / Backlog
- Functional Dark Mode implementation
- Data Export/Backup to CSV/JSON
- Educational Micro-lessons

## Tech Stack
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit + redux-persist + AsyncStorage
- **Navigation**: expo-router
- **UI**: Custom components with StyleSheet.create()
- **Charts**: react-native-gifted-charts
- **Monetization**: react-native-google-mobile-ads

## Code Architecture
```
/app/frontend/
├── app/
│   ├── home.tsx                   # Home with personalized greeting + companion
│   ├── add-expense.tsx            # Quick log with post-log nudge toast
│   ├── challenges.tsx             # Challenges & Goals
│   ├── choose-companion.tsx       # Companion & name selection
│   ├── invite-friends.tsx         # NEW: Invite with rewards
│   ├── share-achievement.tsx      # NEW: Share on social media
│   ├── sms-import.tsx             # SMS parsing with tour
│   ├── settings.tsx               # Settings with Social section
│   └── ...
├── src/
│   ├── core/
│   │   ├── common/
│   │   │   ├── companions.ts      # Companion definitions & greeting logic
│   │   │   ├── smsParser.ts       # SMS parsing logic
│   │   │   ├── nudgeEngine.ts     # Smart nudge logic
│   │   │   └── constants.ts       # Colors, spacing, categories
│   │   ├── services/
│   │   │   ├── adService.ts       # AdMob trigger & tracking
│   │   │   ├── notificationService.ts # Smart notification + companion messages
│   │   │   ├── smsService.ts      # SMS permission handling
│   │   │   └── socialService.ts   # NEW: Invite & share logic
│   │   └── presentation/components/
│   └── features/
│       ├── userPreferences/       # User preferences state
│       └── ...
```

## Test Results (Latest - Iteration 3)
- **Frontend Tests**: 100% pass rate
- **Invite Friends**: 8/8 tests passed
- **Share Achievement**: 5/5 tests passed
- **Settings Social Section**: 6/6 tests passed

## Known Limitations
- Native Share API works on device, may not show dialog on web
- Push notifications simulated on web, work on native
- AdMob only works on native iOS/Android

## Credentials
- **AdMob App ID**: ca-app-pub-7302439791882329~8253964613
- **AdMob Interstitial**: ca-app-pub-7302439791882329/9857602581
- **AdMob Native**: ca-app-pub-7302439791882329/5675144563

## Next Actions
1. Test on native devices with real sharing and notifications
2. Implement functional Dark Mode toggle
3. Implement Data Export/Backup functionality
