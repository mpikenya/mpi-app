// File Location: app/news/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
// Note: Removed SafeAreaView from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router';
import axios from 'axios';
import config from '../../constants/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this
import { Feather } from '@expo/vector-icons';

interface NewsPost {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
}

const NewsDetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets(); // Get the safe area values

  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPostDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${config.BASE_URL}/api/news/${id}`);
          setPost(response.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setError('This post could not be loaded.');
        } finally {
          setLoading(false);
        }
      };
      fetchPostDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'This post could not be found.'}</Text>
      </View>
    );
  }

  const hasImage = !!post.imageUrl;

  return (
    // We use a regular View and apply the bottom inset to handle home indicators
    <View style={[styles.mainWrapper, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={hasImage ? "light-content" : "dark-content"} />
      
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: hasImage ? '#FFFFFF' : '#0ea5e9',
        }}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {hasImage ? (
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
        ) : (
          // Add a spacer if there is no image to prevent text going under the status bar
          <View style={{ height: insets.top + 60 }} />
        )}

        <View style={[
          styles.contentWrapper, 
          hasImage && { marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30 }
        ]}>
          <Text style={styles.title}>Event: {post.title}</Text>

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

          <View style={styles.divider} />
          <Text style={styles.contentHeader}>Full Story</Text>

          <Text style={styles.content}>
            {post.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
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