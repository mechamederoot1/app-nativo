import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import '../global.css';
import { UnreadProvider } from '../frontend/contexts/UnreadContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <UnreadProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="feed" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="visits" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="story" />
          <Stack.Screen name="story/[id]" />
          <Stack.Screen name="create" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </>
    </UnreadProvider>
  );
}
