import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Dimensions, // Import Dimensions to get screen width
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Or expo-router
import config from '../../constants/config'; // Your config file with BASE_URL

// 1. Define the TypeScript type for a single gallery item.
interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

const Gallery = () => {
  // 2. Set up state variables.
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 3. Create the function to fetch data.
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${config.BASE_URL}/api/gallery`);
      setImages(response.data);
      setError(null);
    } catch (err) {
      
      setError("Could not load the gallery. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 4. Use useFocusEffect to refetch data on screen focus.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchImages();
    }, [])
  );

  // Function for "Pull to Refresh"
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchImages();
  }, []);

  // 5. Render a loading indicator.
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
        <Text style={styles.loadingText}>Loading Gallery...</Text>
      </View>
    );
  }

  // 6. Render an error message.
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchImages}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 7. Render the main list of images.
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={images}
        keyExtractor={(item) => item._id}
        // MODIFICATION: Add numColumns={2} to create a two-column grid
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.captionContainer}>
              <Text style={styles.captionText} numberOfLines={2}>{item.caption}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Our Gallery</Text>
            <Text style={styles.headerSubtitle}>Moments from our mission and community work.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>The gallery is empty for now.</Text>
            <Text style={styles.emptySubtext}>Check back later for new photos!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0369A1"]}/>
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

// Get the width of the device screen
const { width } = Dimensions.get('window');

// 8. Professional styling for the entire screen.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#4B5563',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
      backgroundColor: '#0369A1',
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 8,
  },
  retryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16, // Adjust horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  // MODIFICATION: Styles for the two-column card
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    // Calculate the width for each card to fit two columns with spacing
    width: (width / 2) - 16, // (Screen width / 2 columns) - (spacing on both sides)
    margin: 8, // Add margin to create space between cards
  },
  // MODIFICATION: Reduced image height for a better grid look
  image: {
    width: '100%',
    height: 150, // Reduced height
  },
  captionContainer: {
    padding: 12,
  },
  captionText: {
    fontSize: 14, // Slightly smaller font for the smaller card
    color: '#374151',
  },
  emptyText: {
    fontSize: 18,
    color: '#4B5563',
  },
  emptySubtext: {
      marginTop: 8,
      color: '#6B7280',
  },
  listContentContainer: {
    paddingBottom: 110,
  },
});

export default Gallery;