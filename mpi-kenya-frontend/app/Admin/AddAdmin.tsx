// app/Admin/AddAdmin.tsx
import React, { useState } from "react";
import {
  View,
  Text,
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
import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import config from "../../constants/config";

interface ErrorResponse {
  message: string;
}

const AddAdmin = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAdmin = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("adminToken");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please log in again.",
        });
        router.replace("./AdminAuth");
        return;
      }

      await axios.post(
        `${config.BASE_URL}/api/admin/add-admin`,
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "New admin created successfully!",
      });

      router.replace("./Dashboard");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.message || "Failed to add admin. Please try again.";
      Toast.show({
        type: "error",
        text1: "Error adding admin",
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 32,
          }}
        >
          {/* Back Button to Dashboard */}
          <TouchableOpacity
            onPress={() => router.replace("./Dashboard")}
            className="self-start p-2 -ml-2 mb-4 rounded-full"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#0ea5e9" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-slate-800 mb-2">
            Add New Admin
          </Text>
          <Text className="text-gray-500 mb-8">
            Register a new administrator account for the system.
          </Text>

          {/* Name Input */}
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 shadow-sm">
            <Feather name="user" size={20} color="#0ea5e9" />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
              editable={!isSubmitting}
            />
          </View>

          {/* Email Input */}
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 shadow-sm">
            <Feather name="mail" size={20} color="#0ea5e9" />
            <TextInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
            <Feather name="lock" size={20} color="#0ea5e9" />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#0ea5e9" />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-sky-500 rounded-xl py-4 flex-row items-center justify-center ${
              isSubmitting ? "opacity-60" : ""
            }`}
            onPress={handleAddAdmin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Admin</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAdmin;