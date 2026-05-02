import React, { useEffect, useState, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ImageSourcePropType,
  StyleSheet, // For potential fixed header or other specific styles
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

// 2. Dashboard Header Component
interface AdminHeaderProps {
  admin: AdminState;
  onAvatarPress: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ admin, onAvatarPress }) => (
  <View className="flex-row justify-between mt-8 items-center bg-blue-700 rounded-2xl px-5 py-4 shadow-xl shadow-blue-700/20 mb-6">
    <TouchableOpacity onPress={onAvatarPress} className="flex-row items-center flex-1">
      <Image
        source={
          typeof admin.avatar === "string"
            ? { uri: admin.avatar }
            : admin.avatar
        }
        className="w-14 h-14 rounded-full border-2 border-sky-300"
      />
      <View className="ml-4  flex-1">
        <Text className="text-white font-extrabold text-xl" numberOfLines={1}>
          Welcome admin, {admin.name}!
        </Text>
        <Text className="text-sm text-sky-200" numberOfLines={1}>
          {admin.email}
        </Text>
      </View>
    </TouchableOpacity>
    {/* Could add a settings/menu icon here too if needed beyond avatar press */}
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
    style={{ borderColor: colorClass.includes('border-') ? colorClass.split('border-')[1] : 'transparent' }} // Dynamic border color
  >
    <View className="flex-row items-center mb-2">
      <Feather name={icon as any} size={24} color={colorClass.includes('text-') ? colorClass.split('text-')[1] : '#333'} />
      <Text className={`font-semibold text-lg ml-3 ${colorClass.includes('text-') ? colorClass.split('text-')[0] : 'text-gray-800'}`}>
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

// 5. Admin Options Menu Modal
interface AdminMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddAdminPress: () => void;
  onLogoutPress: () => void;
}

const AdminMenuModal: React.FC<AdminMenuModalProps> = ({
  isVisible,
  onClose,
  onAddAdminPress,
  onLogoutPress,
}) => (
  <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/60 p-4">
      <View className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl">
        <Text className="text-lg font-bold text-gray-800 mb-6 text-center">
          Admin Menu
        </Text>

        <TouchableOpacity onPress={onAddAdminPress} className="bg-blue-500 p-3 rounded-lg mb-3">
          <Text className="text-white font-bold text-center">Add New Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogoutPress} className="bg-red-500 p-3 rounded-lg mb-4">
          <Text className="text-white font-bold text-center">Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-2" onPress={onClose}>
          <Text className="text-gray-500 text-center">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// 6. Add Admin Form Modal
interface AddAdminModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  name: string;
  onNameChange: (text: string) => void;
  email: string;
  onEmailChange: (text: string) => void;
  password: string;
  onPasswordChange: (text: string) => void;
  isSubmitting: boolean;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <View className="bg-white w-full p-6 rounded-2xl shadow-xl max-w-sm">
          <Text className="text-xl font-bold text-gray-800 mb-5 text-center">
            Add New Admin
          </Text>

          <TextInput
            className="bg-gray-100 text-gray-800 p-3 rounded-lg mb-3 border border-gray-200"
            placeholder="Full Name"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={onNameChange}
            editable={!isSubmitting}
          />

          <TextInput
            className="bg-gray-100 text-gray-800 p-3 rounded-lg mb-3 border border-gray-200"
            placeholder="Email Address"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />

          <View className="relative mb-5">
            <TextInput
              className="bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-200 pr-12"
              placeholder="Password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              className="absolute right-3 top-3"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#4b5563"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`bg-blue-600 p-4 rounded-xl ${
              isSubmitting ? "opacity-50" : ""
            }`}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-base">
                Create Admin
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="mt-4" onPress={onClose} disabled={isSubmitting}>
            <Text className="text-gray-500 text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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

  const [isMenuVisible, setMenuVisible] = useState<boolean>(false);
  const [isAddAdminVisible, setAddAdminVisible] = useState<boolean>(false);

  const [newAdminName, setNewAdminName] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [newAdminPassword, setNewAdminPassword] = useState<string>("");
  const [isSubmittingNewAdmin, setIsSubmittingNewAdmin] = useState<boolean>(false);

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
        axios.get<DashboardResponse>(
          `${config.BASE_URL}/api/admin/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
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
        error.response?.data?.message || "Please check your network connection.";
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
    setMenuVisible(false); // Close menu on logout
    router.replace("./AdminAuth");
    Toast.show({
      type: ToastType.Info,
      text1: "Logged out",
      text2: "You have been successfully logged out.",
    });
  }, [router]);

  const openAddAdminModal = useCallback(() => {
    setMenuVisible(false); // Close main menu
    setAddAdminVisible(true); // Open add admin modal
    // Clear form fields when opening
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPassword("");
  }, []);

  const handleAddAdmin = useCallback(async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      Toast.show({
        type: ToastType.Error,
        text1: "Missing Fields",
        text2: "Please fill in all fields.",
      });
      return;
    }
    setIsSubmittingNewAdmin(true);
    try {
      const token = await SecureStore.getItemAsync(SecureStoreKeys.AdminToken);
      if (!token) {
        Toast.show({ type: ToastType.Error, text1: "Authentication Error", text2: "Please log in again." });
        router.replace("./AdminAuth");
        return;
      }
      await axios.post(
        `${config.BASE_URL}/api/admin/add-admin`,
        {
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({
        type: ToastType.Success,
        text1: "Success",
        text2: "New admin created successfully!",
      });
      setAddAdminVisible(false); // Close the form on success
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.message || "Failed to add admin. Check server logs.";
      Toast.show({
        type: ToastType.Error,
        text1: "Error adding admin",
        text2: errorMessage,
      });
    } finally {
      setIsSubmittingNewAdmin(false);
    }
  }, [newAdminName, newAdminEmail, newAdminPassword, router]);

  // --- Render Logic with Fallbacks ---
  if (loading) {
    return <FullScreenLoader />;
  }

  if (error && !loading) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-8 px-4">
      <AdminHeader admin={admin} onAvatarPress={() => setMenuVisible(true)} />

      {/* Action Cards Section */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4 px-2">Actions</Text>
        <DashboardCard
          icon="file-text"
          title="Post News"
          description="Publish latest updates and announcements"
          onPress={() => router.push("./AdminPosts")}
          colorClass="bg-sky-50 border-sky-100 text-sky-600"
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
        <Text className="text-xl font-bold text-gray-800 mb-4">Dashboard Stats</Text>
        <View className="flex-row flex-wrap">
          <DashboardStatBox label="Total News" value={stats?.totalNews ?? 0} />
          <DashboardStatBox label="Total Images" value={stats?.totalImages ?? 0} />
          <DashboardStatBox label="Total Partners" value={stats?.totalPartners ?? 0} />
          <DashboardStatBox label="Total Testimonials" value={stats?.totalTestimonials ?? 0} />
        </View>
      </View>

      {/* Modals */}
      <AdminMenuModal
        isVisible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
        onAddAdminPress={openAddAdminModal}
        onLogoutPress={handleLogout}
      />

      <AddAdminModal
        isVisible={isAddAdminVisible}
        onClose={() => setAddAdminVisible(false)}
        onSubmit={handleAddAdmin}
        name={newAdminName}
        onNameChange={setNewAdminName}
        email={newAdminEmail}
        onEmailChange={setNewAdminEmail}
        password={newAdminPassword}
        onPasswordChange={setNewAdminPassword}
        isSubmitting={isSubmittingNewAdmin}
      />
    </ScrollView>
  );
};

export default Dashboard;

// You can define specific StyleSheet for complex cases if Tailwind isn't enough
// const styles = StyleSheet.create({
//   // Example: a fixed header if you wanted one
//   fixedHeader: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     backgroundColor: 'white',
//     paddingBottom: 10, // Adjust for shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 5,
//   },
// });