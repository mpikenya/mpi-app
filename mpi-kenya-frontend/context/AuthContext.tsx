import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Define the shape of our user object
interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

// Define the shape of the context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs on app startup to check for a stored session
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedUserString = await AsyncStorage.getItem('user');

        if (storedToken && storedUserString) {
          setUser(JSON.parse(storedUserString));
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Failed to load user session", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const signIn = async (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    await SecureStore.setItemAsync('userToken', userToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('userToken');
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isLoading,
    signIn,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};