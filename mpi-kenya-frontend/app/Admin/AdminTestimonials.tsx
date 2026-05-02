import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
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

// Interface for Testimonial Items from the database
interface TestimonialItem {
  _id: string;
  name: string;
  text: string;
  imageUrl: string; // Assuming your backend returns imageUrl
}

const AdminTestimonials = () => {
  const [image, setImage] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState<string>("");
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false); // Changed 'loading' to 'uploading' for clarity

  // State for MANAGING existing testimonials
  const [existingTestimonials, setExistingTestimonials] = useState<
    TestimonialItem[]
  >([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState<boolean>(true); // For fetching existing testimonials

  const router = useRouter();
  const testimonialTextInputRef = React.useRef<TextInput | null>(null);

  // --- Data Fetching Logic ---
  const fetchTestimonials = useCallback(async () => {
    try {
      if (existingTestimonials.length === 0) setLoadingTestimonials(true); // Only show full loader if no items yet
      const response = await axios.get(`${config.BASE_URL}/api/testimonials`);
      setExistingTestimonials(response.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not load existing testimonials.",
      });
    } finally {
      setLoadingTestimonials(false);
    }
  }, [existingTestimonials.length]);

  // Refetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoadingTestimonials(true);
      fetchTestimonials();
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
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

 // --- SUBMIT with optimistic update ---
const handleSubmit = async () => {
  if (!image || !reviewerName.trim() || !testimonialText.trim()) {
    Toast.show({
      type: "error",
      text1: "Missing Fields",
      text2: "Please provide an image, name, and testimonial text.",
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

    // Create a temporary optimistic testimonial
    const tempId = `temp-${Date.now()}`;
    const optimisticTestimonial: TestimonialItem = {
      _id: tempId,
      name: reviewerName.trim(),
      text: testimonialText.trim(),
      imageUrl: image,
    };

    // Update state immediately
    setExistingTestimonials((prev) => [optimisticTestimonial, ...prev]);

    // Prepare formData
    const formData = new FormData();
    formData.append("name", reviewerName.trim());
    formData.append("text", testimonialText.trim());

    const uriParts = image.split(".");
    const fileType = uriParts[uriParts.length - 1];
    formData.append("image", {
      uri: image,
      name: `reviewer_avatar_${Date.now()}.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await axios.post(
      `${config.BASE_URL}/api/testimonials`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Replace temp testimonial with actual one from backend
    setExistingTestimonials((prev) =>
      prev.map((t) => (t._id === tempId ? response.data : t))
    );

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Testimonial uploaded successfully!",
    });

    // Clear form
    setImage(null);
    setReviewerName("");
    setTestimonialText("");
  } catch (err) {
    // Revert optimistic add
    setExistingTestimonials((prev) => prev.filter((t) => !t._id.startsWith("temp-")));

    const error = err as AxiosError<ErrorResponse>;
    console.error("Error uploading testimonial:", error.response?.data || error.message);
    Toast.show({
      type: "error",
      text1: "Upload Failed",
      text2: error.response?.data?.message || "Could not upload testimonial.",
    });
  } finally {
    setUploading(false);
  }
};

// --- DELETE with optimistic update ---
const handleDeleteTestimonial = (testimonialId: string) => {
  Alert.alert("Confirm Deletion", "Are you sure you want to delete this testimonial?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        // Optimistically remove it
        const previousTestimonials = existingTestimonials;
        setExistingTestimonials((prev) =>
          prev.filter((t) => t._id !== testimonialId)
        );

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

          await axios.delete(`${config.BASE_URL}/api/testimonials/${testimonialId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Testimonial has been deleted.",
          });
        } catch (err) {
          // Revert deletion if request fails
          setExistingTestimonials(previousTestimonials);

          const error = err as AxiosError<ErrorResponse>;
          console.error("Error deleting testimonial:", error.response?.data || error.message);
          Toast.show({
            type: "error",
            text1: "Deletion Failed",
            text2: error.response?.data?.message || "Could not delete the testimonial.",
          });
        }
      },
    },
  ]);
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={loadingTestimonials && existingTestimonials.length > 0}
              onRefresh={fetchTestimonials}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Testimonial</Text>
          </View>

          {/* --- UPLOAD TESTIMONIAL SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload New Testimonial</Text>
            {/* Image Picker Section */}
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imagePickerTouchable}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.reviewerImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Feather name="camera" size={48} color="#9CA3AF" />
                    <Text style={styles.imagePickerText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.imagePickerHint}>
                Tap to upload reviewer's photo
              </Text>
            </View>

            {/* Reviewer Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reviewer's Name</Text>
              <View style={styles.inputWrapper}>
                <View style={{ marginRight: 8 }}>
                  <Feather name="user" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Jane Doe"
                  placeholderTextColor="#9CA3AF"
                  value={reviewerName}
                  onChangeText={setReviewerName}
                  returnKeyType="next"
                  onSubmitEditing={() => testimonialTextInputRef.current?.focus()}
                />
              </View>
            </View>

            {/* Testimonial Text Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Testimonial Text</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <View style={{ marginTop: 8, marginRight: 8 }}>
                  <Feather name="message-square" size={20} color="#6b7280" />
                </View>
                <TextInput
                  ref={(input) => {
                    testimonialTextInputRef.current = input;
                  }}
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g., 'Being part of MPI has truly transformed...'"
                  placeholderTextColor="#9CA3AF"
                  value={testimonialText}
                  onChangeText={setTestimonialText}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                uploading ? styles.disabledButton : {},
              ]}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Testimonial</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* --- MANAGE EXISTING TESTIMONIALS SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Existing Testimonials</Text>
            {loadingTestimonials && existingTestimonials.length === 0 ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : existingTestimonials.length === 0 ? (
              <Text style={styles.emptyText}>No testimonials found.</Text>
            ) : (
              existingTestimonials.map((testimonial) => (
                <View key={testimonial._id} style={styles.card}>
                  {testimonial.imageUrl && (
                    <Image
                      source={{ uri: testimonial.imageUrl }}
                      style={styles.cardImage}
                    />
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{testimonial.name}</Text>
                    <Text style={styles.cardText} numberOfLines={3}>
                      "{testimonial.text}"
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTestimonial(testimonial._id)}
                  >
                    <Feather name="trash-2" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

// Styles for AdminTestimonials
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  keyboardAvoiding: { flex: 1 },
  scrollView: { flex: 1, padding: 10 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
    paddingHorizontal: 6, // Added padding to align with sections
  },
  backButton: { padding: 8, marginTop: 24, marginLeft: -8 },
  headerTitle: { fontSize: 28, fontWeight: "bold", marginTop: 24, color: "#1a202c", marginLeft: 16 }, // Adjusted text color
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  imagePickerContainer: { marginBottom: 24, alignItems: "center" },
  imagePickerTouchable: {
    width: 120,
    height: 120,
    backgroundColor: "#e2e8f0", // Lighter grey
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#cbd5e0", // Slightly darker border
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewerImage: { width: "100%", height: "100%", borderRadius: 60 },
  imagePickerPlaceholder: { alignItems: "center" },
  imagePickerText: { color: "#64748b", marginTop: 8, fontSize: 14, fontWeight: "500" },
  imagePickerHint: { color: "#6b7280", marginTop: 12, fontSize: 13 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: "#4a5568", fontSize: 15, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12, // Reduced padding slightly
    borderRadius: 10, // Rounded corners
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  textInput: { flex: 1, fontSize: 16, color: "#2d3748" },
  textAreaWrapper: { alignItems: "flex-start", height: 120 }, // Fixed height for text area
  textArea: { height: "100%", paddingTop: 8 }, // Added paddingTop for text alignment
  submitButton: {
    backgroundColor: "#2563eb", // Tailwind blue-600
    padding: 16,
    borderRadius: 30, // Fully rounded button
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 }, // Stronger shadow
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 10, // Added margin
  },
  submitButtonText: { color: "#fff", fontWeight: "800", fontSize: 18 }, // Extra bold
  disabledButton: { opacity: 0.6 },
  bottomPadding: { paddingBottom: 20 },
  emptyText: { textAlign: "center", color: "#6c757d", marginVertical: 20, fontSize: 16 },
    card: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9", // Light gray background
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "#e2e8f0", // Fallback background if image not loaded
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b", // Darker slate
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#475569", // Slate gray for text
    fontStyle: "italic",
  },
  deleteButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fee2e2", // Light red background
    justifyContent: "center",
    alignItems: "center",
  },
});
export default AdminTestimonials;
    
