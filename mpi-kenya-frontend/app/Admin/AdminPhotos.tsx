// AdminPhotos.tsx (Complete Gallery Management Dashboard)

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { router, useFocusEffect } from "expo-router"; 
import { Feather } from "@expo/vector-icons";
import config from "../../constants/config";
import Toast from "react-native-toast-message";

// Interface for images coming from the database
interface GalleryItem {
  _id: string;
  id?: string; // Fallback in case backend uses 'id'
  imageUrl: string;
  caption: string;
}

const AdminPhotos = () => {
  // State for UPLOADING new images
  const [caption, setCaption] = useState("");
  const [imagesToUpload, setImagesToUpload] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // State for DISPLAYING existing images
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // --- Data Fetching Logic ---
  const fetchGalleryImages = useCallback(async () => {
    try {
      setLoadingGallery(true);
      const response = await axios.get(`${config.BASE_URL}/api/gallery`);
      setGalleryImages(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load existing gallery images.");
    } finally {
      setLoadingGallery(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGalleryImages();
    }, [fetchGalleryImages])
  );

  // --- Upload Logic ---
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      setImagesToUpload((prevImages) => [...prevImages, ...uris]);
    }
  };

  const removeImageToUpload = (uriToRemove: string) => {
    setImagesToUpload((prevImages) =>
      prevImages.filter((uri) => uri !== uriToRemove)
    );
  };

  const handleUpload = async () => {
    if (imagesToUpload.length === 0 || !caption) {
      Alert.alert("Error", "At least one image and a caption are required.");
      return;
    }

    try {
      setUploading(true);
      const token = await SecureStore.getItemAsync("adminToken");
      const formData = new FormData();

      imagesToUpload.forEach((uri) => {
        const fileName = uri.split("/").pop() || "image.jpg";
        let fileType = (uri.split(".").pop() || "jpg").toLowerCase();
        
        // Normalize jpg extension to jpeg standard MIME format
        if (fileType === "jpg") {
          fileType = "jpeg";
        }

        formData.append("images", {
          uri,
          type: `image/${fileType}`,
          name: fileName,
        } as any);
      });

      formData.append("caption", caption);

      // FIX: Changed endpoint to match /api/gallery/admin
      await axios.post(`${config.BASE_URL}/api/gallery/admin`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", `${imagesToUpload.length} image(s) uploaded!`);
      // Clear inputs and refetch the gallery
      setCaption("");
      setImagesToUpload([]);
      fetchGalleryImages();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  // --- DELETE Logic ---
  const handleDelete = async (imageId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this image? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("adminToken");
              // FIX: Changed endpoint to match /api/gallery/admin/:id
              await axios.delete(
                `${config.BASE_URL}/api/gallery/admin/${imageId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              Alert.alert("Success", "Image has been deleted.");
              fetchGalleryImages();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Could not delete the image. Please try again."
              });
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/Admin/Dashboard")}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={22} color="#007bff" />
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>

      {/* --- UPLOAD SECTION --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload New Images</Text>
        <TextInput
          style={styles.input}
          placeholder="Caption for this new batch"
          placeholderTextColor="#495057"
          value={caption}
          onChangeText={setCaption}
        />

        <View style={styles.previewContainer}>
          {imagesToUpload.map((uri, idx) => (
            <View key={uri || `preview-${idx}`} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() => removeImageToUpload(uri)}
              >
                <Feather
                  name="x-circle"
                  size={24}
                  color="#FFF"
                  style={styles.removeIconBg}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>
            {imagesToUpload.length > 0 ? "Add More Images" : "Pick Images"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.uploadButton,
            (uploading || imagesToUpload.length === 0) && styles.disabledButton,
          ]}
          onPress={handleUpload}
          disabled={uploading || imagesToUpload.length === 0}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonTextWhite}>
              Upload {imagesToUpload.length > 0 ? imagesToUpload.length : ""}{" "}
              Image(s)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* --- GALLERY MANAGEMENT SECTION --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Existing Gallery</Text>
        {loadingGallery ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : galleryImages.length === 0 ? (
          <Text style={styles.emptyText}>The gallery is currently empty.</Text>
        ) : (
          galleryImages.map((item, index) => {
            const itemKey = item._id || item.id || `gallery-${index}`;
            return (
              <View key={itemKey} style={styles.galleryCard}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.galleryImage}
                />
                <View style={styles.galleryInfo}>
                  <Text style={styles.galleryCaption}>{item.caption}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item._id || item.id || "")}
                  >
                    <Feather name="trash-2" size={20} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 10 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 10,
  },
  input: {
    backgroundColor: "#f1f3f5",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  previewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  imageWrapper: { position: "relative", margin: 5 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeIcon: { position: "absolute", top: -8, right: -8 },
  removeIconBg: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12 },
  button: {
    backgroundColor: "#ced4da",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#495057" },
  uploadButton: { backgroundColor: "#007bff" },
  buttonTextWhite: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.5 },
  emptyText: { textAlign: "center", color: "#6c757d", marginVertical: 20 },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  galleryCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  galleryImage: { width: 80, height: 80, borderRadius: 8 },
  galleryInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  galleryCaption: {
    fontSize: 16,
    color: "#495057",
    flexShrink: 1,
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteButtonText: { color: "#DC2626", marginLeft: 6, fontWeight: "600" },
});

export default AdminPhotos;