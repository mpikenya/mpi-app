import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import config from '@/constants/config';
// --- NEW: Import AsyncStorage ---
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VolunteerFormState {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
}

interface ErrorResponse {
  message: string;
}

// --- NEW: Constants for cooldown ---
const COOLDOWN_DURATION_MINUTES = 20;
const COOLDOWN_STORAGE_KEY = 'volunteer_cooldown_end_time';


const VolunteerScreen = () => {
  const [form, setForm] = useState<VolunteerFormState>({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  // --- NEW: State to manage the cooldown period ---
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // --- NEW: useEffect to check for existing cooldown on screen load ---
  useEffect(() => {
    const checkCooldown = async () => {
      const storedEndTime = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        if (new Date().getTime() < endTime) {
          setCooldownEndTime(endTime);
        } else {
          // Clear expired key
          await AsyncStorage.removeItem(COOLDOWN_STORAGE_KEY);
        }
      }
    };
    checkCooldown();
  }, []);

  // --- NEW: useEffect to manage the countdown timer ---
  useEffect(() => {
    if (!cooldownEndTime) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = cooldownEndTime - now;

      if (difference <= 0) {
        setCooldownEndTime(null); // Cooldown finished
        AsyncStorage.removeItem(COOLDOWN_STORAGE_KEY);
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    // Set initial time left immediately
    calculateTimeLeft();

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [cooldownEndTime]);


  const handleChange = (field: keyof VolunteerFormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.reason) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Form',
        text2: 'Please fill in all the required fields.',
      });
      return;
    }

    setLoading(true);
    // --- NEW: Show a persistent toast while the request is in progress ---
    Toast.show({
        type: 'info',
        text1: 'Submitting Application',
        text2: 'Your volunteer request is being sent...',
        autoHide: false, // Keep it visible until we hide it
        position: 'bottom',
    });

    try {
      await axios.post(`${config.BASE_URL}/api/volunteer`, form);

      // This success toast will automatically replace the 'info' toast
      Toast.show({
        type: 'success',
        text1: 'Application Sent!',
        text2: 'Thank you! We will review your application.',
      });

      setForm({ fullName: '', email: '', phone: '', reason: '' });

      // --- Set and store the cooldown ---
      const endTime = new Date().getTime() + COOLDOWN_DURATION_MINUTES * 60 * 1000;
      await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, endTime.toString());
      setCooldownEndTime(endTime);

    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      // This error toast will also replace the 'info' toast
      if (!error.response) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Please check your internet connection.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: error.response?.data?.message || 'An error occurred. Please try again.',
        });
      }
    } finally {
      // --- NEW: Hide any toast and stop the loading indicator ---
      Toast.hide();
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || !!cooldownEndTime;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* --- HEADER SECTION --- */}
          <ImageBackground
            source={require('../../assets/images/volunteer-icon.jpg')}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay}>
              <Text style={styles.headerTitle}>Become a Volunteer</Text>
              <Text style={styles.headerSubtitle}>
                Join our mission and make a tangible impact at MPI Kenya.
              </Text>
            </View>
          </ImageBackground>

          {/* --- FORM SECTION --- */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Volunteer Application</Text>
            
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={form.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              style={styles.input}
              autoCapitalize="words"
              editable={!isButtonDisabled} // Disables editing when loading or in cooldown
            />

            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
              editable={!isButtonDisabled} // Disables editing
            />

            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => handleChange('phone', text)}
              style={styles.input}
              editable={!isButtonDisabled} // Disables editing
            />

            <TextInput
              placeholder="Why do you want to volunteer?"
              placeholderTextColor="#9CA3AF"
              value={form.reason}
              onChangeText={(text) => handleChange('reason', text)}
              multiline
              style={[styles.input, styles.textArea]}
              editable={!isButtonDisabled} // Disables editing
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, isButtonDisabled && styles.submitButtonDisabled]}
              disabled={isButtonDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {cooldownEndTime ? `Available in ${timeLeft}` : 'Submit Application'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (All your other styles remain the same)
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 130,
  },
  headerImage: {
    height: 350,
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0369A1', // sky-700
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#7DD3FC', // A lighter sky-300
    opacity: 0.7, // Make it look more disabled
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- NEW: Style for the countdown text ---
  cooldownText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
});

export default VolunteerScreen;