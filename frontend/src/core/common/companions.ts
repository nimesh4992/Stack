// Companion/Avatar System for HabitFinance
// Animated characters that accompany user on their financial journey

export interface Companion {
  id: string;
  name: string;
  description: string;
  personality: string;
  lottieSource: any; // Lottie animation source
  color: string;
  greeting: string;
}

// Companion definitions with Lottie animation URLs
// Using free Lottie animations from LottieFiles
export const COMPANIONS: Companion[] = [
  {
    id: 'bear',
    name: 'Teddy',
    description: 'A friendly bear who loves saving honey... and money!',
    personality: 'Warm & Encouraging',
    lottieSource: { uri: 'https://lottie.host/3b3c19b2-06de-4a5f-b1a9-6b8e5a3cd9b1/wF2rLqQKnh.json' },
    color: '#8B5A2B',
    greeting: "Let's save some honey today!",
  },
  {
    id: 'cat',
    name: 'Whiskers',
    description: 'A clever cat who always lands on their feet financially',
    personality: 'Witty & Playful',
    lottieSource: { uri: 'https://lottie.host/d1b2f5e3-8c4a-4e5b-9f6a-7c8d9e0f1a2b/catWave.json' },
    color: '#FF9500',
    greeting: "Purr-fect day to track expenses!",
  },
  {
    id: 'robot',
    name: 'Sparky',
    description: 'A helpful robot who calculates savings with precision',
    personality: 'Smart & Analytical',
    lottieSource: { uri: 'https://lottie.host/a1b2c3d4-e5f6-7890-abcd-ef1234567890/robotWave.json' },
    color: '#5856D6',
    greeting: "Computing your financial success!",
  },
  {
    id: 'panda',
    name: 'Bamboo',
    description: 'A zen panda who takes mindful financial decisions',
    personality: 'Calm & Wise',
    lottieSource: { uri: 'https://lottie.host/b2c3d4e5-f6a7-8901-bcde-f23456789012/pandaWave.json' },
    color: '#34C759',
    greeting: "Balance in all things, including budgets!",
  },
  {
    id: 'fox',
    name: 'Rusty',
    description: 'A cunning fox who knows all the money-saving tricks',
    personality: 'Clever & Resourceful',
    lottieSource: { uri: 'https://lottie.host/c3d4e5f6-a7b8-9012-cdef-345678901234/foxWave.json' },
    color: '#FF6B35',
    greeting: "Ready to outsmart those expenses?",
  },
  {
    id: 'owl',
    name: 'Sage',
    description: 'A wise owl who shares financial wisdom',
    personality: 'Thoughtful & Knowledgeable',
    lottieSource: { uri: 'https://lottie.host/d4e5f6a7-b8c9-0123-defa-456789012345/owlWave.json' },
    color: '#AF52DE',
    greeting: "Wisdom says: track before you spend!",
  },
];

// Get companion by ID
export const getCompanion = (id: string): Companion | undefined => {
  return COMPANIONS.find(c => c.id === id);
};

// Get default companion
export const getDefaultCompanion = (): Companion => {
  return COMPANIONS[0]; // Bear is default
};

// Time-based greeting messages
export const getTimeBasedGreeting = (name: string, hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return `Good Morning, ${name}!`;
  } else if (currentHour >= 12 && currentHour < 17) {
    return `Good Afternoon, ${name}!`;
  } else if (currentHour >= 17 && currentHour < 21) {
    return `Good Evening, ${name}!`;
  } else {
    return `Hey there, ${name}!`;
  }
};

// Get contextual message based on time and activity
export const getContextualMessage = (hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();
  
  const morningMessages = [
    "Start your day right - check your budget!",
    "Morning coffee tracked yet?",
    "A fresh day, a fresh start!",
    "Rise and shine, money-saver!",
  ];
  
  const afternoonMessages = [
    "Lunch expenses logged?",
    "Halfway through the day - how's the budget?",
    "Keep the momentum going!",
    "Remember: every rupee counts!",
  ];
  
  const eveningMessages = [
    "Time to review today's spending!",
    "Evening check-in - you're doing great!",
    "Almost done for the day!",
    "Don't forget to log dinner expenses!",
  ];
  
  const nightMessages = [
    "Quick log before bed?",
    "Night owl? Don't forget your finances!",
    "Late night spending? Log it!",
    "Rest well, save well!",
  ];
  
  let messages: string[];
  if (currentHour >= 5 && currentHour < 12) {
    messages = morningMessages;
  } else if (currentHour >= 12 && currentHour < 17) {
    messages = afternoonMessages;
  } else if (currentHour >= 17 && currentHour < 21) {
    messages = eveningMessages;
  } else {
    messages = nightMessages;
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
};
