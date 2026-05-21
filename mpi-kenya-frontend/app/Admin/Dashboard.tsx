import React, { useEffect, useState, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,

  ImageSourcePropType,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import config from "../../constants/config";
import defaultAvatar from "../../assets/images/admin-pic.png";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

// --- Constants and Enums for better readability and maintainability ---
enum SecureStoreKeys {
  AdminToken = "adminToken",
}

enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
}

// --- TypeScript Type Definitions ---
interface AdminState {
  name: string;
  email: string;
  avatar: string | ImageSourcePropType;
}

interface DashboardResponse {
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardStats {
  totalNews: number;
  totalImages: number;
  recentUploadsCount: number; // Not used in UI but kept for type consistency
  totalPartners: number;
  totalTestimonials: number;
}

interface ErrorResponse {
  message: string;
}

// --- Reusable UI Components ---

// 1. Loading and Error Fallback Components
const FullScreenLoader: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#0ea5e9" />
    <Text className="mt-4 text-gray-600">Loading Dashboard...</Text>
  </View>
);

const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = "Failed to load data. Please try again.",
  onRetry,
}) => (
  <View className="flex-1 items-center justify-center bg-red-50 p-6">
    <Feather name="alert-triangle" size={48} color="#ef4444" />
    <Text className="mt-4 text-lg font-semibold text-red-600 text-center">
      Oops! Something went wrong.
    </Text>
    <Text className="mt-2 text-gray-600 text-center">{message}</Text>
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        className="mt-6 bg-red-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-base">Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Replace your AdminHeader code with this:
interface AdminHeaderProps {
  admin: AdminState;
  onLogoutPress: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ admin, onLogoutPress }) => (
  <View className="flex-row justify-between mt-8 items-center bg-blue-700 rounded-2xl px-5 py-4 shadow-xl shadow-blue-700/20 mb-6">
    <View className="flex-row items-center flex-1 pr-2">
      <Image
        source={
          typeof admin.avatar === "string"
            ? { uri: admin.avatar }
            : admin.avatar
        }
        className="w-14 h-14 rounded-full border-2 border-sky-300"
      />
      <View className="ml-4 flex-1">
        <Text className="text-white font-extrabold text-xl" numberOfLines={1}>
          Welcome admin, {admin.name}!
        </Text>
        <Text className="text-sm text-sky-200" numberOfLines={1}>
          {admin.email}
        </Text>
      </View>
    </View>

    {/* Visible Logout Button */}
    <TouchableOpacity
      onPress={onLogoutPress}
      className="p-3 bg-red-600/20 active:bg-red-600/40 rounded-full"
    >
      <Feather name="log-out" size={20} color="#f87171" />
    </TouchableOpacity>
  </View>
);

// 3. Reusable Action Card Component
interface DashboardCardProps {
  icon: string; // Feather icon name
  title: string;
  description: string;
  onPress: () => void;
  colorClass: string; // e.g., 'bg-sky-50', 'border-sky-100', 'text-sky-600'
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  description,
  onPress,
  colorClass,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-full ${colorClass} p-6 rounded-xl border shadow-sm mb-4`}
    style={{
      borderColor: colorClass.includes("border-")
        ? colorClass.split("border-")[1]
        : "transparent",
    }} // Dynamic border color
  >
    <View className="flex-row items-center mb-2">
      <Feather
        name={icon as any}
        size={24}
        color={
          colorClass.includes("text-") ? colorClass.split("text-")[1] : "#333"
        }
      />
      <Text
        className={`font-semibold text-lg ml-3 ${colorClass.includes("text-") ? colorClass.split("text-")[0] : "text-gray-800"}`}
      >
        {title}
      </Text>
    </View>
    <Text className="text-gray-500 text-sm mt-1">{description}</Text>
  </TouchableOpacity>
);

// 4. Reusable Stat Box Component
interface DashboardStatBoxProps {
  label: string;
  value: number | string;
  colorClass?: string; // e.g., 'text-sky-600'
}

const DashboardStatBox: React.FC<DashboardStatBoxProps> = ({
  label,
  value,
  colorClass = "text-sky-600",
}) => (
  <View className="flex-1 items-center p-3">
    <Text className={`text-3xl font-extrabold ${colorClass}`}>
      {value !== null ? value : "..."}
    </Text>
    <Text className="text-sm text-gray-500 mt-1 text-center">{label}</Text>
  </View>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [admin, setAdmin] = useState<AdminState>({
    name: "",
    email: "",
    avatar: defaultAvatar,
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // For general dashboard errors

 

  const router = useRouter();

  // Use useCallback for memoizing functions passed to child components
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync(SecureStoreKeys.AdminToken);
      if (!token) {
        router.replace("./AdminAuth");
        return;
      }

      const [adminRes, statsRes] = await Promise.all([
        axios.get<DashboardResponse>(`${config.BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<DashboardStats>(`${config.BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAdmin({
        name: adminRes.data.name,
        email: adminRes.data.email,
        avatar: adminRes.data.avatar || defaultAvatar,
      });
      setStats(statsRes.data);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.message ||
        "Please check your network connection.";
      setError(errorMessage); // Set specific error message for retry
      Toast.show({
        type: ToastType.Error,
        text1: "Error loading dashboard",
        text2: errorMessage,
      });
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        await SecureStore.deleteItemAsync(SecureStoreKeys.AdminToken);
        router.replace("./AdminAuth");
        Toast.show({
          type: ToastType.Error,
          text1: "Session Expired",
          text2: "Please log in again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Dependency array includes the memoized function

  const handleLogout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SecureStoreKeys.AdminToken);
     // Close menu on logout
    router.replace("./AdminAuth");
    Toast.show({
      type: ToastType.Info,
      text1: "Logged out",
      text2: "You have been successfully logged out.",
    });
  }, [router]);

  // --- Render Logic with Fallbacks ---
  if (loading) {
    return <FullScreenLoader />;
  }

  if (error && !loading) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-8 px-4">
      <AdminHeader
        admin={admin}
        onLogoutPress={handleLogout} // Passed the logout logic directly
      />

      {/* Action Cards Section */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4 px-2">
          Actions
        </Text>
        <DashboardCard
          icon="file-text"
          title="Post News"
          description="Publish latest updates and announcements"
          onPress={() => router.push("./AdminPosts")}
          colorClass="bg-sky-50 border-sky-100 text-sky-600"
        />
        <DashboardCard
          icon="user-plus"
          title="Add New Admin"
          description="Register a new administrator account"
          onPress={() => router.push("./AddAdmin")}
          colorClass="bg-blue-50 border-blue-100 text-blue-600"
        />
        <DashboardCard
          icon="image"
          title="Upload Photos"
          description="Add event photos to the gallery"
          onPress={() => router.push("./AdminPhotos")}
          colorClass="bg-indigo-50 border-indigo-100 text-indigo-600"
        />
        <DashboardCard
          icon="share-2"
          title="Upload Partner Logos"
          description="Display new partner logos on the site"
          onPress={() => router.push("./AdminLogos")}
          colorClass="bg-green-50 border-green-100 text-green-600"
        />
        <DashboardCard
          icon="message-square"
          title="Add Testimonials"
          description="Collect and display member reviews"
          onPress={() => router.push("./AdminTestimonials")}
          colorClass="bg-purple-50 border-purple-100 text-purple-600"
        />
        <DashboardCard
          icon="users"
          title="Manage Users"
          description="View and manage normal user accounts"
          onPress={() => router.push("./NormalUsersView")}
          colorClass="bg-yellow-50 border-yellow-100 text-yellow-600"
        />
        <DashboardCard
          icon="shield"
          title="Admin Personnel"
          description="Browse and manage admin accounts"
          onPress={() => router.push("./AdminPersonnel")}
          colorClass="bg-red-50 border-red-100 text-red-600"
        />
      </View>

      {/* Stats Section */}
      <View className="mt-4 bg-white p-5 mb-14 rounded-2xl border border-gray-100 shadow-md ">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Dashboard Stats
        </Text>
        <View className="flex-row flex-wrap">
          <DashboardStatBox label="Total News" value={stats?.totalNews ?? 0} />
          <DashboardStatBox
            label="Total Images"
            value={stats?.totalImages ?? 0}
          />
          <DashboardStatBox
            label="Total Partners"
            value={stats?.totalPartners ?? 0}
          />
          <DashboardStatBox
            label="Total Testimonials"
            value={stats?.totalTestimonials ?? 0}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;

