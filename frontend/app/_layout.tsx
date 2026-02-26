// 📍 Root Layout - Redux Provider & Navigation Setup
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* Force dark status bar for light backgrounds */}
      <StatusBar style="dark" backgroundColor="#F8FAFC" translucent={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
        <Stack.Screen name="add-expense" />
        <Stack.Screen name="highlights" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="sms-import" />
        <Stack.Screen name="challenges" />
      </Stack>
    </Provider>
  );
}
