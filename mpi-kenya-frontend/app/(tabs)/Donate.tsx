import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import * as ClipboardAPI from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';

const Donate = () => {
  const accountNumber = '01134681170300';//real account number
  const paybillNumber = '400200'; // it is the actual paybill number
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Clipboard not supported on web.');
      return;
    }
    await ClipboardAPI.setStringAsync(accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // it  Resets after 2 seconds
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/images/donate-icon.jpg')} // Use a powerful, high-quality background image
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Join Our Mission</Text>
            <Text style={styles.headerSubtitle}>
              Empower communities in Kenya through education, peacebuilding, and sustainable development. Your support creates lasting change.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donate to our MPI Cooperative Bank</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Paybill Number</Text>
              <Text style={styles.accountNumber}>{paybillNumber}</Text>
              <Text style={styles.accountLabel}>Account Number</Text>
              <Text style={styles.accountNumber}>{accountNumber}</Text>
            </View>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.copyButton, isCopied && styles.copiedButton]}
              disabled={isCopied}>
              <Feather name={isCopied ? 'check-circle' : 'copy'} size={20} color="#3B82F6" />
              <Text style={styles.copyButtonText}>
                {isCopied ? 'Copied to Clipboard' : 'Copy Account Number'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>🙏 Thank you for your generosity.</Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark overlay
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  accountInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accountLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copiedButton: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  copyButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});

export default Donate;