import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import config from "../../constants/config";

// --- TypeScript interfaces ---
interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  message: string;
}

const AdminAuth = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const res = await axios.post<LoginResponse>(
        `${config.BASE_URL}/api/auth/admin`,
        { email, password }
      );

      if (res.data?.token) {
        await SecureStore.setItemAsync("adminToken", res.data.token);
        Toast.show({ type: "success", text1: "Admin Login Successful" });
        router.replace("/Admin/Dashboard");
      } else {
        throw new Error("Login response did not include a token.");
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;

      if (!error.response) {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your internet connection and try again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2:
            error.response?.data?.message ||
            "Invalid credentials or server error.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        // Adjusting behavior depending on OS layout engine
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true} // Enabled to make it visually clear that scrolling is available
          automaticallyAdjustKeyboardInsets={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 10, // Reduced from 20 to save top space
            paddingBottom: 32, // Reduced from 48
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.replace("/SignScreen")}
            className="self-start p-2 -ml-2 mb-2 rounded-full" // Reduced mb-4 to mb-2
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#0ea5e9" />
          </TouchableOpacity>

          {/* MPI Kenya Logo - Scaled down to prevent pushing inputs down */}
          <View className="items-center mb-4"> 
            <Image
              source={require("../../assets/images/mpi-logo.jpeg")}
              className="w-36 h-20" // Reduced from w-48 h-36
              resizeMode="contain"
            />
          </View>

          {/* Admin Icon - Scaled down */}
          <View className="items-center mb-2">
            <Image
              source={require("../../assets/images/user-gear.png")}
              className="w-20 h-16" // Reduced from w-32 h-24
              resizeMode="contain"
            />
          </View>

          {/* Title - Compact size */}
          <Text className="text-2xl font-bold text-center text-slate-800 mb-4">
            Admin Login
          </Text>

          {/* Email Input */}
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 shadow-sm">
            <Feather name="mail" size={20} color="#0ea5e9" />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 shadow-sm">
            <Feather name="lock" size={20} color="#0ea5e9" />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="ml-2"
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#0ea5e9"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`bg-sky-500 rounded-xl py-4 mt-2 flex-row items-center justify-center ${
              loading ? "opacity-60" : ""
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminAuth;