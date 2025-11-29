import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-schema';
// import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
// import { tokenCache } from '@/utils/cache';

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// if (!publishableKey) {
//   throw new Error(
//     'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
//   );
// }

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
    //   <ClerkLoaded>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
    //   </ClerkLoaded>
    // </ClerkProvider>
  );
}