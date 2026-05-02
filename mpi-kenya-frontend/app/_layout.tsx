// File: app/_layout.tsx

import React, { useEffect, useState } from "react";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import "./global.css";
import Toast from "react-native-toast-message";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const [didRedirect, setDidRedirect] = useState(false);

  useEffect(() => {
    if (!navigationState?.key || isLoading || didRedirect) return;

    if (user) {
      router.replace("/(tabs)/Home");
    } else {
      router.replace("/WelcomeScreen2");
    }

    setDidRedirect(true); // prevent repeated redirects
  }, [user, isLoading, navigationState?.key, didRedirect]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Core routes */}
        <Stack.Screen name="index" />
        <Stack.Screen name="WelcomeScreen2" />
        <Stack.Screen name="(tabs)" />

        {/* Auth flow */}
        <Stack.Screen name="SignScreen" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="ForgotPasswordScreen"
          options={{ presentation: "modal", title: "Forgot Password" }}
        />
        <Stack.Screen
          name="EnterOTPScreen"
          options={{ presentation: "modal", title: "Verification" }}
        />
        <Stack.Screen
          name="ResetPasswordScreen"
          options={{ presentation: "modal", title: "New Password" }}
        />

        {/* Profile */}
        <Stack.Screen
          name="Profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            presentation: "modal",
          }}
        />
      </Stack>
      <Toast />
    </View>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
