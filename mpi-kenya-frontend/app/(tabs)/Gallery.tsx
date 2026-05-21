import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import config from '../../constants/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

const { width } = Dimensions.get('window');

const Gallery = () => {
  const insets = useSafeAreaInsets();
  
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  // 1. Monitor Internet Connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const fetchImages = async () => {
    // Check connection before fetching
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setIsConnected(false);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setIsConnected(true);
      const response = await axios.get(`${config.BASE_URL}/api/gallery`);
      setImages(response.data);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Could not load the gallery. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchImages();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchImages();
  }, []);

  // --- UI Components for Different States ---

  const renderNoInternet = () => (
    <View style={styles.centerContainer}>
      <View style={styles.iconCircle}>
        <Feather name="wifi-off" size={40} color="#ef4444" />
      </View>
      <Text style={styles.errorTitle}>No Internet Connection</Text>
      <Text style={styles.errorSubtitle}>
        It looks like you&apos;re offline. Please check your settings and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchImages}>
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Render Logic ---

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
        <Text style={styles.loadingText}>Loading Gallery...</Text>
      </View>
    );
  }

  // Show "No Internet" UI if disconnected and no data exists
  if (!isConnected && images.length === 0) {
    return renderNoInternet();
  }

  if (error && images.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#94a3b8" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchImages}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <FlatList
        data={images}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
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
            <Feather name="image" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>The gallery is empty for now.</Text>
            <Text style={styles.emptySubtext}>Check back later for new photos!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0369A1"]} />
        }
        contentContainerStyle={styles.listContentContainer}
      />
      
      {/* Small floating "Offline" indicator if data is shown but user loses connection */}
      {!isConnected && images.length > 0 && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>You are currently offline</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#0369A1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    width: (width / 2) - 24,
    margin: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: 160,
  },
  captionContainer: {
    padding: 12,
  },
  captionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubtext: {
    marginTop: 8,
    color: '#6B7280',
  },
  listContentContainer: {
    paddingBottom: 100,
  },
  offlineBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#374151',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default Gallery;