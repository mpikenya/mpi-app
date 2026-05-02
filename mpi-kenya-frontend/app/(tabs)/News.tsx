// News.tsx (with a professional empty state)

import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import config from "../../constants/config";
import axios from "axios";
import { Feather } from '@expo/vector-icons'; // Import Feather icons

// Define the shape of a NewsPost object
interface NewsPost {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
}

const News = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchNews = useCallback(async () => {
    try {
      if (posts.length === 0) setLoading(true); 
      const response = await axios.get(`${config.BASE_URL}/api/news`);
      setPosts(response.data);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [posts.length]);

    useFocusEffect(
      useCallback(() => {
        setLoading(true); // Show loader when screen is focused
        fetchNews();
      }, [])
    );

  // --- NEW: A separate component for the empty state for cleaner code ---
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="archive" size={48} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        There are no news & events posted right now. We'll update this page as soon as there's something new to share.
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={loading && posts.length > 0} onRefresh={fetchNews} colors={["#0ea5e9"]}/>}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News & Events</Text>
        <Text style={styles.headerSubtitle}>
          Stay updated with what's happening at MPI Kenya
        </Text>
      </View>

      {/* --- MODIFIED LOGIC: Added the empty state check --- */}
      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : !loading && posts.length === 0 ? (
        renderEmptyState() // <-- Call the new function here
      ) : (
        posts.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            onPress={() => router.push({
              pathname: "/News/[id]",
              params: { id: item._id }
            })}
          >
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/mpi-logo.jpeg')}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardDate}>{new Date(item.date).toDateString()}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardSummary} numberOfLines={3}>
                {item.content.substring(0, 100)}...
              </Text>
              <Text style={styles.readMore}>Read More →</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

// Add the new styles for the empty state
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 100,
    flexGrow: 1, // Ensures the empty state can be centered
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- NEW STYLES FOR THE EMPTY STATE ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  // --- END OF NEW STYLES ---
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
});

export default News;