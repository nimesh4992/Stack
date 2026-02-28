# 🏗️ Stack App - Architectural Restructuring Plan
## Lead Tech Architect Recommendations

---

## 📊 Current State Analysis

### Issues Identified:

1. **Duplicate Files** - Multiple versions of same screens (home.tsx, home-old.tsx, home-basic.tsx)
2. **Monorepo Confusion** - Two package.json files causing EAS build issues
3. **No Code Splitting** - All screens loaded at once
4. **Heavy Dependencies** - TensorFlow.js included but may not be needed for MVP
5. **Inconsistent State Management** - Mix of Redux, local state, and AsyncStorage
6. **No Performance Monitoring** - No error boundaries or performance tracking
7. **Shadow/Elevation Issues** - CSS shadow deprecation warnings

---

## 🎯 Recommended Architecture

### Option A: Flat Expo Structure (RECOMMENDED for APK Building)

```
/stack-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation group
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Home (Dashboard)
│   │   ├── insights.tsx          # Analytics
│   │   └── settings.tsx          # Settings
│   ├── (modals)/                 # Modal screens group
│   │   ├── add-expense.tsx
│   │   └── highlights.tsx
│   ├── (auth)/                   # Auth screens (if needed)
│   │   └── onboarding.tsx
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 handler
├── src/
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Atomic components (Button, Card, etc.)
│   │   ├── forms/                # Form components
│   │   └── charts/               # Chart components
│   ├── features/                 # Feature modules (keep current)
│   │   ├── expenses/
│   │   ├── gamification/
│   │   └── habits/
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API & device services
│   ├── store/                    # Redux store
│   ├── utils/                    # Helper functions
│   └── constants/                # App constants
├── assets/                       # Images, fonts
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── package.json                  # Single package.json
├── metro.config.js
├── babel.config.js
└── tsconfig.json
```

### Key Changes:
1. **Single package.json** at root (no frontend subfolder)
2. **Expo Router Groups** for better navigation organization
3. **Cleaned up** duplicate files
4. **Optimized imports** with barrel files

---

## 🚀 Performance Optimizations

### 1. Lazy Loading & Code Splitting
```typescript
// Use dynamic imports for heavy screens
const HeavyChart = React.lazy(() => import('../components/charts/HeavyChart'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart />
</Suspense>
```

### 2. Memoization Strategy
```typescript
// Use React.memo for list items
export const TransactionItem = React.memo(({ transaction }) => {
  // Component code
});

// Use useMemo for expensive calculations
const expensiveData = useMemo(() => calculateTotals(transactions), [transactions]);

// Use useCallback for event handlers passed to children
const handlePress = useCallback(() => {
  // handler code
}, [dependencies]);
```

### 3. FlashList for Better List Performance
```typescript
// Replace FlatList with FlashList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={transactions}
  renderItem={renderTransaction}
  estimatedItemSize={80}  // Important for performance
  keyExtractor={(item) => item.id}
/>
```

### 4. Image Optimization
```typescript
// Use expo-image instead of Image
import { Image } from 'expo-image';

<Image
  source={uri}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 5. Remove Unused Dependencies
```json
// Remove from package.json if not actively used:
- "@tensorflow/tfjs"           // Heavy, remove if not using ML
- "@tensorflow/tfjs-react-native"
- "react-native-svg-charts"   // Using gifted-charts instead
```

---

## 🔧 Bug Fixes Strategy

### 1. Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. Fix Shadow Deprecation
```typescript
// Replace shadow* props with boxShadow (React Native Web)
// For native, keep using shadow* props with Platform.select

const cardStyle = Platform.select({
  web: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### 3. Safe Area Handling
```typescript
// Create a wrapper component
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenWrapper({ children, edges = ['top'] }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      edges.includes('top') && { paddingTop: insets.top },
      edges.includes('bottom') && { paddingBottom: insets.bottom },
    ]}>
      {children}
    </View>
  );
}
```

---

## 📦 EAS Build Configuration (Optimized)

### eas.json
```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "base": {
      "node": "20.18.0",
      "env": {
        "EXPO_NO_CAPABILITY_SYNC": "1",
        "EAS_NO_VCS": "1"
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "extends": "base",
      "channel": "production",
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": true
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "internal"
      }
    }
  }
}
```

### app.json (Optimized)
```json
{
  "expo": {
    "name": "Stack",
    "slug": "stack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "stack",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      },
      "package": "com.habitfinance.stack",
      "versionCode": 1,
      "permissions": [
        "POST_NOTIFICATIONS",
        "VIBRATE"
      ]
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.habitfinance.stack",
      "buildNumber": "1"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#4F46E5"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## 🔄 Migration Steps

### Phase 1: Cleanup (Day 1)
1. Remove duplicate files:
   - `home-old.tsx`, `home-basic.tsx`
   - `add-expense-old.tsx`
   - `onboarding-old.tsx`
2. Remove unused dependencies
3. Fix all TypeScript errors

### Phase 2: Restructure (Day 2-3)
1. Move app to root (eliminate /frontend)
2. Implement Expo Router groups
3. Create barrel exports (index.ts files)
4. Add Error Boundaries

### Phase 3: Performance (Day 4-5)
1. Replace FlatList with FlashList
2. Add React.memo to list items
3. Implement lazy loading for heavy screens
4. Optimize images with expo-image

### Phase 4: Testing & Build (Day 6-7)
1. Test all screens on Android device
2. Run EAS preview build
3. Fix any build issues
4. Submit to Play Console internal track

---

## 📋 Immediate Actions (Quick Wins)

### 1. Clean Up Duplicate Files
```bash
rm frontend/app/home-old.tsx
rm frontend/app/home-basic.tsx
rm frontend/app/add-expense-old.tsx
rm frontend/app/onboarding-old.tsx
```

### 2. Remove Heavy Unused Dependencies
```bash
yarn remove @tensorflow/tfjs @tensorflow/tfjs-react-native react-native-svg-charts
```

### 3. Add Performance Monitoring
```typescript
// Add to _layout.tsx
if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, { trackAllPureComponents: true });
}
```

---

## 🎯 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| APK Size | ~50MB | <30MB |
| Cold Start | ~3s | <1.5s |
| Screen Transitions | ~300ms | <100ms |
| Build Success Rate | 70% | 99% |
| Crash-free Sessions | - | >99.5% |

---

## 📞 Next Steps

1. **Approve this plan** with stakeholders
2. **Create feature branch** for restructuring
3. **Execute Phase 1** (cleanup) immediately
4. **Test EAS build** after each phase
5. **Monitor performance** with React DevTools

---

*Document Version: 1.0*
*Last Updated: August 2025*
*Author: Lead Tech Architect*
