// File Location: app/news/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import axios, { AxiosError } from 'axios';
import config from '../../constants/config';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Interface for the fetched news post data
interface NewsPost {
  _id: string;
  title: string;
  content: string; // This content is now treated as plain text
  imageUrl?: string;
  date: string;
}

const NewsDetailsPage = () => {
  // Get the post ID from the URL parameters
  const { id } = useLocalSearchParams<{ id: string }>();
  // Get safe area insets for proper spacing
  const insets = useSafeAreaInsets();

  // State management for the component
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post details when the component mounts or the ID changes
  useEffect(() => {
    if (id) {
      const fetchPostDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${config.BASE_URL}/api/news/${id}`);
          setPost(response.data);
        } catch (err) {
          const axiosError = err as AxiosError;
          if (!axiosError.response) {
            Toast.show({ type: 'error', text1: 'Network Error', text2: 'Please check your internet connection.' });
            setError('Could not connect to the server.');
          } else {
            Toast.show({ type: 'error', text1: 'Error Loading Post', text2: 'The requested post could not be found.' });
            setError('This post could not be loaded.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchPostDetails();
    }
  }, [id]);

  // --- Render loading state ---
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
      </View>
    );
  }

  // --- Render error state ---
  if (error || !post) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'This post could not be found.'}</Text>
      </View>
    );
  }

  // --- Render the main content ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Image */}
        {post.imageUrl && (
          <Image 
            source={{ uri: post.imageUrl }} 
            style={[styles.heroImage, { marginTop: insets.top }]} 
            resizeMode="cover"
          />
        )}

        {/* Content Section */}
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Event: {post.title}</Text>

          {/* Metadata Box */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Feather name="calendar" style={styles.metaIcon} />
              <Text style={styles.metaText}>Posted on: {" "}
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="user" style={styles.metaIcon} />
              <Text style={styles.metaText}>Posted by MPI-Kenya Admin</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />
          <Text style={styles.contentHeader}>Full Story</Text>

          {/* Plain Text Content Display */}
          <Text style={styles.content}>
            {post.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  contentWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0ea5e9',
    lineHeight: 34,
    marginBottom: 16,
  },
  metaContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaIcon: {
    fontSize: 16,
    color: '#0369A1',
    marginRight: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  contentHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 28,
  },
});

export default NewsDetailsPage;