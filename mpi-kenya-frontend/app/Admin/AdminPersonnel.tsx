import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios, { AxiosError } from 'axios';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import config from '../../constants/config';
// MODIFICATION: Import an icon library
import { Feather } from '@expo/vector-icons';

interface Admin {
  _id: string;
  name: string;
  email: string;
}

const AdminPersonnel = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      const token = await SecureStore.getItemAsync('adminToken');
      const response = await axios.get(`${config.BASE_URL}/api/admin/personnel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load admin personnel.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAdmins();
    }, [])
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#0369A1" /></View>;
  }

  if (error) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Personnel</Text>
      <FlatList
        data={admins}
        keyExtractor={(item) => item._id}
        // MODIFICATION: The entire renderItem is updated for the new card design
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            {/* Row for Name */}
            <View style={styles.detailRow}>
              <Feather name="user" size={20} style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={styles.labelText}>Name</Text>
                <Text style={styles.valueText}>{item.name}</Text>
              </View>
            </View>

            {/* Row for Email */}
            <View style={styles.detailRow}>
              <Feather name="mail" size={20} style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={styles.labelText}>Email</Text>
                <Text style={styles.valueText}>{item.email}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No admin personnel found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }} // Add some padding at the bottom
      />
    </View>
  );
};

// MODIFICATION: Styles are completely revamped for a more professional look
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', // Lighter gray background
    paddingHorizontal: 16,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#111827', 
    paddingTop: 16,
    paddingBottom: 16,
    marginTop:16,
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: { 
    color: '#EF4444', 
    fontSize: 16,
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#6B7280', 
    fontSize: 16,
  },
  // New card style with shadow for depth
  adminCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Style for each row (icon + text)
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Space between rows
  },
  icon: {
    color: '#0369A1', // A nice blue color for the icons
    marginRight: 16,
  },
  textContainer: {
    flexDirection: 'column',
  },
  // Style for the small "Name" / "Email" label
  labelText: {
    fontSize: 12,
    color: '#6B7280', // Medium gray for the label
    marginBottom: 2,
  },
  // Style for the actual name and email data
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937', // Darker gray for the value
  },
});

export default AdminPersonnel;