# Stack Finance - Project Structure

## 📁 Final Folder Structure

```
/app/
├── package.json              # Root package.json for EAS Build
├── eas.json                  # EAS Build configuration
├── app.json                  # Expo configuration (points to frontend/assets)
├── metro.config.js           # Metro bundler config
├── babel.config.js           # Babel configuration
├── tsconfig.json             # TypeScript configuration
├── ARCHITECTURE_RESTRUCTURE_PLAN.md
├── GOOGLE_PLAY_COMPLIANCE.md
│
├── backend/                  # FastAPI Backend
│   ├── server.py             # Main server
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Backend environment variables
│
└── frontend/                 # Expo React Native App
    ├── package.json          # Frontend dependencies (used in dev)
    ├── app.json              # Frontend Expo config
    ├── metro.config.js       # Frontend Metro config
    ├── tsconfig.json         # Frontend TypeScript config
    │
    ├── app/                  # Expo Router screens (file-based routing)
    │   ├── _layout.tsx       # Root layout with Redux Provider
    │   ├── index.tsx         # Entry point (redirects to onboarding/home)
    │   ├── home.tsx          # Main dashboard
    │   ├── add-expense.tsx   # Quick log screen
    │   ├── settings.tsx      # Settings screen
    │   ├── insights.tsx      # Analytics & charts
    │   ├── highlights.tsx    # Spotify Wrapped-style highlights
    │   ├── challenges.tsx    # Goals & challenges
    │   ├── sms-import.tsx    # SMS import screen
    │   ├── faqs.tsx          # FAQ screen
    │   ├── privacy-policy.tsx
    │   ├── onboarding.tsx    # Initial setup flow
    │   ├── ai-insights.tsx   # AI-powered insights
    │   ├── choose-companion.tsx
    │   ├── edit-profile.tsx
    │   ├── google-drive-backup.tsx
    │   ├── habits-tracker.tsx
    │   ├── help-support.tsx
    │   ├── invite-friends.tsx
    │   ├── share-achievement.tsx
    │   └── widgets.tsx
    │
    ├── src/
    │   ├── store/            # Redux store
    │   │   └── index.ts      # Store configuration
    │   │
    │   ├── features/         # Feature-based Redux slices
    │   │   ├── index.ts      # Barrel export ⭐
    │   │   ├── expenseTracking/
    │   │   │   └── expenseSlice.ts
    │   │   ├── gamification/
    │   │   │   └── gamificationSlice.ts
    │   │   ├── habits/
    │   │   │   └── habitsSlice.ts
    │   │   ├── onboarding/
    │   │   │   └── onboardingSlice.ts
    │   │   └── userPreferences/
    │   │       └── userPreferencesSlice.ts
    │   │
    │   └── core/             # Shared functionality
    │       ├── index.ts      # Core barrel export ⭐
    │       │
    │       ├── common/       # Constants, utilities
    │       │   ├── index.ts  # Barrel export ⭐
    │       │   ├── constants.ts
    │       │   ├── utils.ts
    │       │   ├── smsParser.ts
    │       │   ├── nudgeEngine.ts
    │       │   └── companions.ts
    │       │
    │       ├── data/         # Storage, models
    │       │   ├── index.ts  # Barrel export ⭐
    │       │   ├── storage.ts
    │       │   └── models.ts
    │       │
    │       ├── services/     # External services
    │       │   ├── index.ts  # Barrel export ⭐
    │       │   ├── notificationService.ts
    │       │   ├── smsService.ts
    │       │   ├── adService.ts
    │       │   ├── aiEngine.ts
    │       │   └── widgetService.ts
    │       │
    │       └── presentation/ # UI components
    │           └── components/
    │               ├── index.ts  # Barrel export ⭐
    │               ├── Card.tsx
    │               ├── CircularProgress.tsx
    │               ├── NudgeCard.tsx
    │               ├── CompanionAvatar.tsx
    │               ├── SecurityInfoModal.tsx
    │               ├── StreakCalendar.tsx
    │               ├── SMSConsentDisclosure.tsx
    │               ├── SMSTour.tsx
    │               └── Highlights.tsx
    │
    └── assets/               # Static assets
        ├── images/
        │   ├── icon.png
        │   ├── splash-icon.png
        │   ├── adaptive-icon.png
        │   └── ...
        └── fonts/
```

## 🔧 Key Changes Made

### 1. Barrel Exports (index.ts files)
- `/src/core/index.ts` - Main entry for all core functionality
- `/src/core/common/index.ts` - Constants, utils, helpers
- `/src/core/data/index.ts` - Storage, models
- `/src/core/services/index.ts` - All services
- `/src/core/presentation/components/index.ts` - All UI components
- `/src/features/index.ts` - All Redux slices

### 2. Import Examples
```typescript
// Before (messy)
import { COLORS } from '../src/core/common/constants';
import { formatCurrency } from '../src/core/common/utils';
import { Card } from '../src/core/presentation/components/Card';

// After (clean with barrel exports)
import { COLORS, formatCurrency } from '@/core/common';
import { Card, NudgeCard } from '@/core/presentation/components';
```

### 3. EAS Build Ready
- Root `/package.json` for EAS builds
- Root `/eas.json` with development/preview/production profiles
- Root `/app.json` pointing to frontend assets

## 📦 Build Commands

```bash
# Development APK (debug)
eas build --platform android --profile development

# Preview APK (testing)
eas build --platform android --profile preview

# Production AAB (Play Store)
eas build --platform android --profile production
```

## 🔄 Next Steps

1. ✅ Barrel exports created
2. ✅ TypeScript errors fixed
3. ✅ Folder structure documented
4. ⏳ Update imports to use barrel exports (optional refactor)
5. ⏳ Add path aliases (@/) for cleaner imports

---

*Last Updated: August 2025*
