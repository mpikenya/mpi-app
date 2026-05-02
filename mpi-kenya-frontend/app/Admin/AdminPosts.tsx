// AdminNews.tsx (Upgraded to a Full Dashboard)

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useFocusEffect, Stack } from "expo-router";
import config from "../../constants/config";
import { Feather } from "@expo/vector-icons";

// Interface for News Posts from the database
interface NewsPostItem {
  _id: string;
  title: string;
  date: string;
  imageUrl?: string;
}

const AdminNews = () => {
  // --- State for CREATING a new post ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contentHeight, setContentHeight] = useState(120);

  // --- State for MANAGING existing posts ---
  const [existingPosts, setExistingPosts] = useState<NewsPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // --- Data Fetching Logic ---
  const fetchNewsPosts = useCallback(async () => {
    try {
      if (existingPosts.length === 0) setLoadingPosts(true);
      // Fetch all posts
      const response = await axios.get(`${config.BASE_URL}/api/news`);
      setExistingPosts(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load existing posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, [existingPosts.length]);

  // Refetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoadingPosts(true); // Show loader when screen is focused
      fetchNewsPosts();
    }, [])
  );

  // --- CREATE Logic ---
  const pickImage = async () => {
    /* ... this function is unchanged ... */
  };
  const handlePostNews = async () => {
    if (!title || !content || !date) {
      Alert.alert("Missing Info", "Please provide a title, content, and date.");
      return;
    }
    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync("adminToken");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("date", date.toISOString());
      if (image) {
        const fileName = image.split("/").pop()!;
        const fileType = image.split(".").pop();
        formData.append("image", {
          uri: image,
          type: `image/${fileType}`,
          name: fileName,
        } as any);
      }
      await axios.post(`${config.BASE_URL}/api/news/admin`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert("Success", "News posted successfully!");
      // Clear form and refetch the list
      setTitle("");
      setContent("");
      setDate(new Date());
      setImage(null);
      fetchNewsPosts();
    } catch (error) {
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // --- DELETE Logic ---
  const handleDeletePost = (postId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("adminToken");
              await axios.delete(
                `${config.BASE_URL}/api/news/admin/${postId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert("Success", "Post has been deleted.");
              fetchNewsPosts(); // Refetch to update the list
            } catch (error) {
              Alert.alert("Error", "Could not delete the post.");
            }
          },
        },
      ]
    );
  };

  // Re-add the pickImage function for completeness
  const pickImageUnchanged = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loadingPosts && existingPosts.length > 0}
          onRefresh={fetchNewsPosts}
        />
      }
    >
      <Stack.Screen options={{ title: "News & Events Dashboard" }} />

      {/* --- CREATE POST SECTION --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Post</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#495057"
        />
        <TextInput
          style={[styles.input, styles.textArea, { height: contentHeight }]}
          placeholder="Write detailed content (Indicate Event Date)..."
          placeholderTextColor="#495057"
          value={content}
          onChangeText={setContent}
          multiline
          onContentSizeChange={(event) => {
            setContentHeight(event.nativeEvent.contentSize.height);
          }}
        />
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>📅 {date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity style={styles.button} onPress={pickImageUnchanged}>
          <Text style={styles.buttonText}>
            {image ? "Change Image" : "Add Image (optional)"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.uploadButton,
            uploading && styles.disabledButton,
          ]}
          onPress={handlePostNews}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonTextWhite}>Post News</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* --- MANAGE POSTS SECTION --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Existing Posts</Text>
        {loadingPosts && existingPosts.length === 0 ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : existingPosts.length === 0 ? (
          <Text style={styles.emptyText}>No news posts found.</Text>
        ) : (
          existingPosts.map((post) => (
            <View key={post._id} style={styles.card}>
              {post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.cardImage}
                />
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text style={styles.cardDate}>
                  {new Date(post.date).toDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePost(post._id)}
              >
                <Feather name="trash-2" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// I've converted your Tailwind classes to a StyleSheet for better organization
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 10 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#f1f3f5",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { textAlignVertical: "top" },
  dateButton: {
    backgroundColor: "#e7f5ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: { color: "#007bff", fontWeight: "500", textAlign: "center" },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
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
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  cardImage: { width: 50, height: 50, borderRadius: 8 },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#343a40" },
  cardDate: { fontSize: 12, color: "#6c757d", marginTop: 4 },
  deleteButton: { padding: 8 },
});

export default AdminNews;
