import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import config from '../../constants/config';
import Toast from 'react-native-toast-message';
// MODIFICATION: Import an icon library
import { Feather } from '@expo/vector-icons'; 

// Define the type for a user object
interface User {
  _id: string;
  name: string;
  email: string;
}

const NormalUsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = await SecureStore.getItemAsync('adminToken');
      const response = await axios.get(`${config.BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to load users. Please check your connection.');
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUsers();
    }, [])
  );

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the user "${userName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('adminToken');
              await axios.delete(`${config.BASE_URL}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
              Toast.show({ type: 'success', text1: 'User Deleted' });
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Deletion Failed', text2: 'Could not delete the user.' });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#0369A1" /></View>;
  }

  if (error) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Accounts</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        // MODIFICATION: The renderItem is completely updated for the new card design
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            {/* User Details Section */}
            <View style={styles.userInfoSection}>
              <View style={styles.detailRow}>
                <Feather name="user" size={20} style={styles.icon} />
                <View>
                  <Text style={styles.labelText}>Name</Text>
                  <Text style={styles.valueText}>{item.name}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Feather name="mail" size={20} style={styles.icon} />
                <View>
                  <Text style={styles.labelText}>Email</Text>
                  <Text style={styles.valueText} numberOfLines={1}>{item.email}</Text>
                </View>
              </View>
            </View>
            
            {/* Divider and Actions Section */}
            <View style={styles.divider} />
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDelete(item._id, item.name)}
              >
                <Feather name="trash-2" size={16} color="#DC2626" />
                <Text style={styles.deleteButtonText}>Delete User</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No normal users found.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

// MODIFICATION: All styles are updated for the new card-based design
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 16 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#111827', 
    paddingTop: 16,
    paddingBottom: 16,
    marginTop:20,
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 50,
  },
  errorText: { 
    color: '#EF4444', 
    fontSize: 16 
  },
  emptyText: { 
    color: '#6B7280', 
    fontSize: 16 
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoSection: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  icon: {
    color: '#0369A1',
    marginRight: 16,
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  actionsContainer: {
    padding: 12,
    alignItems: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default NormalUsersView;