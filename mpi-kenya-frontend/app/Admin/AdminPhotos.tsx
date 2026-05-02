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
  FlatList, // Using FlatList for the existing gallery for better performance
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "expo-router"; // Or from '@react-navigation/native'
import { Feather } from "@expo/vector-icons";
import config from "../../constants/config";
import Toast from "react-native-toast-message";

// Interface for images coming from the database
interface GalleryItem {
  _id: string;
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

  // useFocusEffect will refetch images every time the admin visits this screen
  // CORRECT: This passes a non-async function that CONTAINS an async call
  useFocusEffect(
    useCallback(() => {
      // This is the function that runs when the screen is focused
      fetchGalleryImages();

      // The return value here is 'undefined', which is valid
    }, [fetchGalleryImages]) // Rerun the effect if fetchGalleryImages changes (due to useCallback)
  );

  // --- Upload Logic (Mostly unchanged) ---
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
        const fileType = uri.split(".").pop() || "jpg";
        formData.append("images", {
          uri,
          type: `image/${fileType}`,
          name: fileName,
        } as any);
      });

      formData.append("caption", caption);

      await axios.post(`${config.BASE_URL}/api/admin/gallery`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", `${imagesToUpload.length} image(s) uploaded!`);
      // Clear inputs and refetch the gallery to show the new images
      setCaption("");
      setImagesToUpload([]);
      fetchGalleryImages();
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

  // --- New DELETE Logic ---
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
              await axios.delete(
                `${config.BASE_URL}/api/admin/gallery/${imageId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              Alert.alert("Success", "Image has been deleted.");
              // Refetch the gallery to reflect the deletion
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

  // --- JSX Rendering ---
  return (
    <ScrollView style={styles.container}>
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
          {imagesToUpload.map((uri) => (
            <View key={uri} style={styles.imageWrapper}>
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
          galleryImages.map((item) => (
            <View key={item._id} style={styles.galleryCard}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.galleryImage}
              />
              <View style={styles.galleryInfo}>
                <Text style={styles.galleryCaption}>{item.caption}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Feather name="trash-2" size={20} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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

  // Styles for the gallery list
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
