import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
  RefreshControl,
  StyleSheet, // Added for consistent styling with AdminNews
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import config from "../../constants/config";
import Toast from "react-native-toast-message";
import { useRouter, useFocusEffect } from "expo-router";

interface ErrorResponse {
  message: string;
}

// Interface for Partner Logo Items from the database
interface PartnerLogoItem {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string; // Assuming your backend returns imageUrl
}

const AdminLogos = () => {
  const [image, setImage] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerDescription, setPartnerDescription] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false); // Changed 'loading' to 'uploading' for clarity

  // State for MANAGING existing logos
  const [existingLogos, setExistingLogos] = useState<PartnerLogoItem[]>([]);
  const [loadingLogos, setLoadingLogos] = useState<boolean>(true); // For fetching existing logos

  const router = useRouter();

  // --- Data Fetching Logic ---
  const fetchPartnerLogos = useCallback(async () => {
    try {
      if (existingLogos.length === 0) setLoadingLogos(true); // Only show full loader if no items yet
      const response = await axios.get(`${config.BASE_URL}/api/partners`);
      setExistingLogos(response.data);
    } catch (error) {
      console.error("Error fetching partner logos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not load existing partner logos.",
      });
    } finally {
      setLoadingLogos(false);
    }
  }, [existingLogos.length]);

  // Refetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoadingLogos(true);
      fetchPartnerLogos();
    }, [])
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Please grant media library permissions to upload images.",
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image || !partnerName.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide a logo and partner name.",
      });
      return;
    }

    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync("adminToken");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Unauthorized",
          text2: "Please log in again.",
        });
        router.replace("./AdminAuth");
        return;
      }

      const formData = new FormData();
      formData.append("name", partnerName.trim());
      if (partnerDescription.trim()) {
        formData.append("description", partnerDescription.trim());
      }

      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: image,
        name: `partner_logo_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      await axios.post(`${config.BASE_URL}/api/partners`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Partner logo uploaded successfully!",
      });
      // Clear form and refetch the list
      setImage(null);
      setPartnerName("");
      setPartnerDescription("");
      fetchPartnerLogos();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error("Error uploading partner:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.response?.data?.message || "Could not upload partner logo.",
      });
    } finally {
      setUploading(false);
    }
  };

  // --- DELETE Logic ---
  const handleDeleteLogo = (logoId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this partner logo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("adminToken");
              if (!token) {
                Toast.show({
                  type: "error",
                  text1: "Unauthorized",
                  text2: "Please log in again.",
                });
                router.replace("./AdminAuth");
                return;
              }
              await axios.delete(
                `${config.BASE_URL}/api/partners/${logoId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Partner logo has been deleted.",
              });
              fetchPartnerLogos(); // Refetch to update the list
            } catch (err) {
              const error = err as AxiosError<ErrorResponse>;
              console.error("Error deleting partner:", error.response?.data || error.message);
              Toast.show({
                type: "error",
                text1: "Deletion Failed",
                text2: error.response?.data?.message || "Could not delete the partner logo.",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        className={`flex-row items-center p-4 bg-white border-b border-gray-200 ${
          Platform.OS === "ios" ? "pt-12" : "pt-4"
        } shadow-md`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 mt-14 mr-2">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold mt-14 text-gray-800 flex-1 text-center pr-8">
          Manage Partner Logos
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loadingLogos && existingLogos.length > 0}
            onRefresh={fetchPartnerLogos}
          />
        }
      >
        {/* --- UPLOAD LOGO SECTION --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload New Partner Logo</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-56 bg-gray-100 rounded-2xl justify-center items-center border-2 border-dashed border-gray-300 mb-8 overflow-hidden"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <View className="items-center p-4">
                <Feather name="upload-cloud" size={56} color="#64748b" />
                <Text className="text-gray-600 mt-3 text-base font-medium text-center">
                  Tap to Select or Drop Image
                </Text>
                <Text className="text-gray-400 text-sm mt-1 text-center">
                  Recommended: 4:3 Aspect Ratio (max 2MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Partner Name */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">Partner Name</Text>
            <View className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200">
              <View style={{ marginRight: 8 }}>
                <Feather name="tag" size={20} color="#6b7280" />
              </View>
              <TextInput
                className="flex-1 text-lg text-gray-800"
                placeholder="e.g., Google, UNICEF"
                placeholderTextColor="#94a3b8"
                value={partnerName}
                onChangeText={setPartnerName}
              />
            </View>
          </View>

          {/* Partner Description */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              Partner Description (Optional)
            </Text>
            <View className="flex-row items-start bg-white p-3 rounded-xl border border-gray-200 h-32">
              <View style={{ marginTop: 8, marginRight: 8 }}>
                <Feather name="align-left" size={20} color="#6b7280" />
              </View>
              <TextInput
                className="flex-1 text-lg text-gray-800"
                placeholder="Short description about the partner..."
                placeholderTextColor="#94a3b8"
                value={partnerDescription}
                onChangeText={setPartnerDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            className={`bg-blue-600 p-4 rounded-xl flex-row justify-center items-center ${
              uploading ? "opacity-60" : ""
            }`}
            disabled={uploading}
            style={{
              shadowColor: "#2563eb",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5.46,
              elevation: 9,
            }}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-bold text-center text-xl">Upload Logo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- MANAGE EXISTING LOGOS SECTION --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Existing Logos</Text>
          {loadingLogos && existingLogos.length === 0 ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : existingLogos.length === 0 ? (
            <Text style={styles.emptyText}>No partner logos found.</Text>
          ) : (
            existingLogos.map((logo) => (
              <View key={logo._id} style={styles.card}>
                {logo.imageUrl && (
                  <Image
                    source={{ uri: logo.imageUrl }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {logo.name}
                  </Text>
                  {logo.description && (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {logo.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteLogo(logo._id)}
                >
                  <Feather name="trash-2" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
      <Toast />
    </View>
  );
};

// Reusing styles similar to AdminNews for consistency
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollView: { flex: 1, padding: 10 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12, // Increased border radius for a softer look
    padding: 18, // Slightly more padding
    marginBottom: 20,
    shadowColor: "#000", // Added shadow for a lifted effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20, // Slightly smaller than AdminNews header for sub-sections
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
    borderBottomWidth: 1, // Add a subtle separator
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  emptyText: { textAlign: "center", color: "#6c757d", marginVertical: 20, fontSize: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9", // Lighter background for cards
    borderRadius: 10, // Rounded cards
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1.5,
  },
  cardImage: { width: 60, height: 45, borderRadius: 6, marginRight: 12 }, // Adjusted for logo aspect
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#343a40", marginBottom: 4 },
  cardDescription: { fontSize: 13, color: "#6c757d" },
  deleteButton: { padding: 8, marginLeft: 10 },
  bottomPadding: { paddingBottom: 20 }, // Ensures content isn't cut off by toast/bottom of screen
});

export default AdminLogos;