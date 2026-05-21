import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import styles from "./SignScreen2.styles";
import { Feather, Ionicons } from "@expo/vector-icons"; // Changed to Ionicons for the sparkle icon
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import config from "../constants/config";
import { LinearGradient } from "expo-linear-gradient";

// Custom Auth Context
import { useAuth } from "../context/AuthContext";

interface ErrorResponse {
  message: string;
}

// --- Helpers for credentials persistence ---
async function saveCredentials(email: string, password: string) {
  try {
    await SecureStore.setItemAsync(
      "userCredentials",
      JSON.stringify({ email, password })
    );
  } catch (err) {
    console.log("Failed to save credentials:", err);
  }
}

async function getCredentials() {
  try {
    const creds = await SecureStore.getItemAsync("userCredentials");
    return creds ? JSON.parse(creds) : null;
  } catch (err) {
    console.log("Failed to get credentials:", err);
    return null;
  }
}

const SignScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  // Screen States
  const [activeTab, setActiveTab] = useState<"signup" | "login">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Announcement Modal States
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // --- Effects ---
  useEffect(() => {
    // 1. Load saved credentials
    (async () => {
      const creds = await getCredentials();
      if (creds) {
        setFormData((prev) => ({
          ...prev,
          email: creds.email,
          password: creds.password,
        }));
      }
    })();

    // 2. Start Sparkling Animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Auto-close modal after 6 seconds
    const timer = setTimeout(() => {
      setShowAnnouncement(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // --- Handlers ---
  const handleTabChange = (tab: "signup" | "login") => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setActiveTab(tab);
  };

  const handleSignup = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill in all required fields." });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords Do Not Match", text2: "Please check your passwords." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${config.BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;
      await signIn(user, token);
      await saveCredentials(formData.email, formData.password);

      Toast.show({ type: "success", text1: "Account Created!", text2: `Welcome, ${user.name}!` });
      router.replace("/(tabs)/Home");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      Toast.show({ 
        type: "error", 
        text1: "Registration Failed", 
        text2: error.response?.data?.message || "An unexpected error occurred." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill in both email and password." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${config.BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;
      await signIn(user, token);
      await saveCredentials(formData.email, formData.password);

      Toast.show({ type: "success", text1: "Login Successful", text2: `Welcome back, ${user.name}` });
      router.replace("/(tabs)/Home");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      Toast.show({ 
        type: "error", 
        text1: "Login Failed", 
        text2: error.response?.data?.message || "Invalid credentials." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    activeTab === "signup" ? handleSignup() : handleLogin();
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      {activeTab === "signup" && (
        <Input
          placeholder="Full Name"
          icon="user"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!isLoading}
        />
      )}
      <Input
        placeholder="Email Address"
        icon="mail"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <Input
        placeholder="Password"
        icon="lock"
        secureTextEntry={!showPassword}
        showPasswordToggle
        showPassword={showPassword}
        onToggleVisibility={() => setShowPassword(!showPassword)}
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        editable={!isLoading}
      />
      {activeTab === "signup" && (
        <Input
          placeholder="Confirm Password"
          icon="lock"
          secureTextEntry={!showPassword}
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          editable={!isLoading}
        />
      )}

      {activeTab === "login" && (
        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginBottom: 16 }}
          onPress={() => router.push("./ForgotPasswordScreen")}
        >
          <Text style={{ color: "#4F46E5", fontWeight: "600" }}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {activeTab === "signup" ? "Create Account" : "Sign In"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.socialContainer}>
        {activeTab === "login" && (
          <TouchableOpacity 
            style={styles.laaButton} 
            onPress={() => router.push("/Admin/AdminAuth")} 
            disabled={isLoading}
          >
            <Text style={styles.laaText}>LAA</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#fff" }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* --- SPARKLING ANNOUNCEMENT MODAL --- */}
      <Modal transparent visible={showAnnouncement} animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.sparkleWrapper}>
            {/* The rotating gradient border background */}
            <Animated.View style={[localStyles.gradientBorder, { transform: [{ rotate: rotation }] }]}>
              <LinearGradient
                colors={["#4F46E5", "#0EA5E9", "#F472B6", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </Animated.View>

            {/* Content Container */}
            <View style={localStyles.modalContent}>
              <TouchableOpacity 
                style={localStyles.closeButton} 
                onPress={() => setShowAnnouncement(false)}
              >
                <Feather name="x" size={22} color="#94a3b8" />
              </TouchableOpacity>

              <View style={localStyles.iconContainer}>
                <Ionicons name="sparkles" size={32} color="#0ea5e9" />
              </View>

              <Text style={localStyles.modalTitle}>Important Notice</Text>
              <Text style={localStyles.modalBody}>
                Due to a technical glitch in the MPI database, we require all users to <Text style={{fontWeight: '700', color: '#0ea5e9'}}>re-register</Text> their accounts.
              </Text>
              <Text style={localStyles.modalApologyText}>
                We sincerely apologize for any inconvenience caused. Thank you for your patience.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image 
              source={require("../assets/images/mpi-logo.jpeg")} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <View style={styles.tabContainer}>
            {["signup", "login"].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={styles.tab} 
                onPress={() => handleTabChange(tab as "signup" | "login")} 
                disabled={isLoading}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab === "signup" ? "Sign Up" : "Login"}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {renderForm()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {activeTab === "signup" ? "Already have an account? " : "Don't have an account? "}
              <Text 
                style={styles.footerLink} 
                onPress={() => !isLoading && handleTabChange(activeTab === "signup" ? "login" : "signup")}
              >
                {activeTab === "signup" ? "Login" : "Sign Up"}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Custom Styles for the Modal ---
const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sparkleWrapper: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 3, 
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBorder: {
    position: "absolute",
    width: "200%",
    height: "200%",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 21,
    padding: 24,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 14,
    top: 14,
    padding: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  modalApologyText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
  },
});

// --- Custom Input Component ---
type FeatherIconName = keyof typeof Feather.glyphMap;
type InputProps = {
  placeholder: string;
  icon: FeatherIconName;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onToggleVisibility?: () => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

const Input: React.FC<InputProps> = ({
  placeholder,
  icon,
  value,
  onChangeText,
  editable = true,
  secureTextEntry,
  showPasswordToggle,
  showPassword,
  onToggleVisibility,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) => (
  <View style={styles.inputContainer}>
    <Feather name={icon} size={20} color="#0ea5e9" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {showPasswordToggle && (
      <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeIcon}>
        <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#0ea5e9" />
      </TouchableOpacity>
    )}
  </View>
);

export default SignScreen;