# 🏗️ HabitFinance Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                     (React Native + Expo Router)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Onboarding  │  │     Home     │  │ Add Expense  │          │
│  │    Screen    │─▶│  Dashboard   │◀─│    Screen    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                 │
│                            │                                     │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│                     ┌──────▼──────┐                             │
│                     │   REDUX     │                             │
│                     │   STORE     │                             │
│                     └──────┬──────┘                             │
│                            │                                     │
│          ┌─────────────────┼─────────────────┐                 │
│          │                 │                 │                  │
│    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐           │
│    │ Onboarding│    │  Expense  │    │Gamification│           │
│    │   Slice   │    │   Slice   │    │   Slice   │           │
│    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘           │
│          │                 │                 │                  │
├──────────┼─────────────────┼─────────────────┼──────────────────┤
│          │                 │                 │                  │
│          └─────────────────┼─────────────────┘                 │
│                            │                                     │
│                     ┌──────▼──────┐                             │
│                     │   STORAGE   │                             │
│                     │   SERVICE   │                             │
│                     │(AsyncStorage)│                            │
│                     └─────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Interaction Flow
```
User Action (UI)
    │
    ▼
Component Event Handler
    │
    ▼
Dispatch Redux Action (Async Thunk)
    │
    ├─▶ Update State (Reducer)
    │
    └─▶ Persist to Storage (AsyncStorage)
    │
    ▼
UI Re-renders (useSelector)
```

### 2. App Initialization Flow
```
App Launch
    │
    ▼
Splash Screen (index.tsx)
    │
    ├─▶ Load User Profile
    ├─▶ Load Transactions
    └─▶ Load Gamification Data
    │
    ▼
Check Onboarding Status
    │
    ├─▶ Not Complete ──▶ Navigate to Onboarding
    │
    └─▶ Complete ──────▶ Navigate to Home
```

### 3. Transaction Logging Flow
```
User Adds Transaction
    │
    ▼
Validate Input (Amount, Category)
    │
    ▼
Dispatch addTransaction
    │
    ├─▶ Create Transaction Object
    ├─▶ Add to Transactions Array
    └─▶ Save to AsyncStorage
    │
    ▼
Award Points & Update Streak
    │
    ├─▶ Calculate Points (10 pts)
    ├─▶ Update Current Streak
    ├─▶ Update Level (if threshold met)
    └─▶ Save Gamification State
    │
    ▼
Show Success Feedback
    │
    ▼
Navigate Back to Home
```

---

## Module Structure (Lego Blocks)

### 🧩 Core Module
**Purpose:** Shared utilities and components used across all features

```
core/
├── common/           # Constants, theme, utilities
│   ├── constants.ts  # App-wide constants (colors, categories)
│   ├── theme.ts      # Light/dark theme definitions
│   └── utils.ts      # Helper functions (formatting, date)
│
├── data/            # Data layer abstractions
│   ├── models.ts    # TypeScript interfaces
│   └── storage.ts   # Storage service wrapper
│
└── presentation/    # Reusable UI components
    └── components/
        ├── Button.tsx
        ├── Card.tsx
        └── Input.tsx
```

### 🎯 Onboarding Module
**Purpose:** First-time user experience and profile setup

```
features/onboarding/
└── onboardingSlice.ts
    ├── State: { isComplete, userProfile, currentStep, quizAnswers }
    ├── Actions: setQuizAnswer, nextStep, prevStep, resetOnboarding
    └── Thunks: loadOnboardingStatus, completeOnboarding
```

### 💰 Expense Tracking Module
**Purpose:** Transaction management (expenses & income)

```
features/expenseTracking/
└── expenseSlice.ts
    ├── State: { transactions[], loading, filter }
    ├── Actions: setFilter
    ├── Thunks: loadTransactions, addTransaction, deleteTransaction
    └── Selectors: selectTodayTransactions, selectTodayBalance
```

### 🎮 Gamification Module
**Purpose:** Points, levels, streaks, and badges

```
features/gamification/
└── gamificationSlice.ts
    ├── State: { points, level, currentStreak, longestStreak, badges[] }
    ├── Thunks: loadGamification, awardPoints, updateStreak
    └── Logic: Level calculation (1 level per 500 points)
```

---

## State Management Philosophy

### Redux Toolkit Approach
- **Feature-Scoped Slices:** Each feature has its own reducer
- **Async Thunks:** Handle side effects (storage, calculations)
- **Selectors:** Computed values (derived state)
- **Immutable Updates:** Using Immer (built into Redux Toolkit)

### Storage Strategy
- **Optimistic Updates:** Update Redux state immediately
- **Async Persistence:** Save to AsyncStorage in background
- **Load on Mount:** Restore state from storage on app launch

---

## Component Hierarchy

```
App (_layout.tsx)
├── Provider (Redux)
│
├── Stack Navigator
    ├── Splash (index.tsx)
    │   └── Initialization Logic
    │
    ├── Onboarding (onboarding.tsx)
    │   ├── Header (Gradient)
    │   ├── Progress Dots
    │   ├── Question Display
    │   └── Option Cards / Input
    │
    ├── Home (home.tsx)
    │   ├── Header (Gradient)
    │   │   ├── Greeting
    │   │   ├── User Name
    │   │   └── Level Badge
    │   │
    │   ├── Balance Card
    │   │   ├── Today's Balance
    │   │   ├── Streak Badge
    │   │   └── Motivational Text
    │   │
    │   ├── Stats Cards (3)
    │   │   ├── Today's Logs
    │   │   ├── Monthly Goal
    │   │   └── Badges Earned
    │   │
    │   ├── Recent Activity
    │   │   └── Transaction List
    │   │
    │   └── FAB (+ Button)
    │
    └── Add Transaction (add-expense.tsx)
        ├── Header (Back button)
        ├── Type Selector (Expense/Income)
        ├── Amount Input
        ├── Category Grid
        ├── Note Input
        └── Save Button
```

---

## Performance Optimizations

### 1. Redux Selectors
- `selectTodayTransactions`: Memoized calculation
- `selectTodayBalance`: Derived from today's transactions
- Only re-compute when dependencies change

### 2. Component Optimization
- `React.memo` for expensive list items (future)
- `useMemo` for complex calculations
- `useCallback` for event handlers passed to children

### 3. Storage Efficiency
- Batch writes to AsyncStorage
- Only persist necessary data
- Use JSON serialization for complex objects

---

## Error Handling Strategy

### 1. Storage Errors
```typescript
try {
  await storageService.saveTransactions(transactions);
} catch (error) {
  console.error('Storage failed:', error);
  // App continues with in-memory state
  // Show user notification (future)
}
```

### 2. Validation Errors
- Client-side validation before submission
- User-friendly error messages via Alert
- Prevent invalid state updates

### 3. Navigation Errors
- Fallback to onboarding if profile missing
- Handle deep link failures gracefully

---

## Security Considerations

### Current (Phase 1)
- ✅ Local-only storage (no network requests)
- ✅ No sensitive data collected
- ✅ AsyncStorage for general data

### Future (Phase 2+)
- 🔒 Expo SecureStore for sensitive data (if needed)
- 🔒 SMS permission handling (runtime permissions)
- 🔒 Data encryption at rest (if required by regulations)

---

## Scalability Plan

### Adding New Features (Modular Approach)

1. **Create Feature Module**
   ```
   src/features/newFeature/
   ├── newFeatureSlice.ts
   ├── components/
   └── screens/
   ```

2. **Register in Redux Store**
   ```typescript
   // src/store/index.ts
   import newFeatureReducer from '../features/newFeature/newFeatureSlice';
   
   export const store = configureStore({
     reducer: {
       // ... existing
       newFeature: newFeatureReducer,
     },
   });
   ```

3. **Add Screen Routes**
   ```typescript
   // app/new-feature.tsx
   export default function NewFeatureScreen() { ... }
   ```

4. **Update Navigation**
   ```typescript
   // app/_layout.tsx
   <Stack.Screen name="new-feature" />
   ```

### Benefits of This Architecture
- ✅ **Independent Development:** Features don't interfere
- ✅ **Easy Testing:** Test each module in isolation
- ✅ **Code Reusability:** Shared core utilities
- ✅ **Type Safety:** TypeScript interfaces everywhere
- ✅ **Maintainability:** Clear separation of concerns

---

## Testing Strategy (Future)

### Unit Tests
- Redux reducers and selectors
- Utility functions (formatting, calculations)
- Business logic (streak calculations, points)

### Integration Tests
- Complete user flows (onboarding → home → add transaction)
- Redux state updates with storage persistence
- Navigation between screens

### E2E Tests
- Automated UI testing with Detox
- Critical user journeys

---

**Architecture Philosophy:**  
"Build features like Lego blocks – independent, reusable, and easy to snap together!"

---

*Last Updated: Phase 1 Complete - February 2026*
