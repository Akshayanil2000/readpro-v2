import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_800ExtraBold_Italic
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
  Lora_400Regular_Italic
} from '@expo-google-fonts/lora';
import {
  CrimsonPro_400Regular,
  CrimsonPro_600SemiBold,
  CrimsonPro_700Bold,
  CrimsonPro_400Regular_Italic
} from '@expo-google-fonts/crimson-pro';
import {
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold
} from '@expo-google-fonts/lexend';
import {
  Newsreader_400Regular,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import {
  NotoSerif_400Regular,
  NotoSerif_400Regular_Italic,
  NotoSerif_700Bold,
  NotoSerif_700Bold_Italic,
} from '@expo-google-fonts/noto-serif';


import LandingScreen from './src/features/onboarding/screens/LandingScreen';
import OnboardingScreen from './src/features/onboarding/screens/OnboardingScreen';
import AssessmentIntroScreen from './src/features/assessment/screens/AssessmentIntroScreen';
import AssessmentReadingScreen from './src/features/assessment/screens/AssessmentReadingScreen';
import AssessmentQuizScreen from './src/features/assessment/screens/AssessmentQuizScreen';
import AssessmentResultScreen from './src/features/assessment/screens/AssessmentResultScreen';
import DashboardScreen from './src/features/dashboard/screens/DashboardScreen';
import InsightsScreen from './src/features/dashboard/screens/InsightsScreen';
import ProfileScreen from './src/features/dashboard/screens/ProfileScreen';
import RegisterScreen from './src/features/auth/screens/RegisterScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import { COLORS } from './src/core/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        PlayfairDisplay_400Regular,
        PlayfairDisplay_700Bold,
        PlayfairDisplay_700Bold_Italic,
        PlayfairDisplay_800ExtraBold,
        PlayfairDisplay_800ExtraBold_Italic,
        Lora_400Regular,
        Lora_400Regular_Italic,
        Lora_500Medium,
        Lora_600SemiBold,
        Lora_700Bold,
        CrimsonPro_400Regular,
        CrimsonPro_400Regular_Italic,
        CrimsonPro_600SemiBold,
        CrimsonPro_700Bold,
        Lexend_300Light,
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_600SemiBold,
        Lexend_700Bold,
        Newsreader_400Regular,
        Newsreader_500Medium,
        Newsreader_600SemiBold,
        Newsreader_700Bold,
        NotoSans_400Regular,
        NotoSans_500Medium,
        NotoSans_600SemiBold,
        NotoSans_700Bold,
        NotoSerif_400Regular,
        NotoSerif_400Regular_Italic,
        NotoSerif_700Bold,
        NotoSerif_700Bold_Italic
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AssessmentIntro" component={AssessmentIntroScreen} />
            <Stack.Screen name="AssessmentReading" component={AssessmentReadingScreen} />
            <Stack.Screen name="AssessmentQuiz" component={AssessmentQuizScreen} />
            <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
});
