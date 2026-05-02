import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    SafeAreaView,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import config from '../constants/config';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Load images from the assets folder
const MpiLogo = require('../assets/images/mpi-logo.jpeg');
const ForgotPasswordIllustration = require('../assets/images/forgot-password.png');

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid email address.' });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/request-password-reset`, { email });
            Toast.show({ type: 'info', text1: 'Check Your Inbox', text2: response.data.message, visibilityTime: 4000 });
            
            if (response.data.canProceed === true) {
                router.push({ pathname: '/EnterOTPScreen', params: { email } });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Could not send the reset link. Please try again.';
            Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.container}>
                        <Image source={MpiLogo} style={styles.logo} />
                        <Image source={ForgotPasswordIllustration} style={styles.illustration} />
                        
                        <Text style={styles.title}>Forgot Your Password?</Text>
                        <Text style={styles.subtitle}>Enter your email below and we will send you a code to reset it.</Text>
                        
                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email address"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                textContentType="emailAddress"
                            />
                        </View>

                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: { 
        flex: 1,
        alignItems: 'center',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        // Adjusted top position for better alignment with content
        top: Platform.OS === 'ios' ? 50 : 60, 
        left: 20,
        zIndex: 1,
        padding: 10,
    },
    logo: {
        width: 200,
        height: 150,
        resizeMode: 'contain',
        // --- CHANGE 1: Added marginTop to create space above the logo ---
        marginTop: 30, 
        marginBottom: 20,
    },
    illustration: {
        // --- CHANGE 2: Increased width and height to make the image bigger ---
        width: 300, 
        height: 250, 
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#1F2937', 
        textAlign: 'center',
        marginBottom: 8 
    },
    subtitle: { 
        fontSize: 15, 
        color: '#6B7280', 
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        maxWidth: '90%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: '100%',
        marginBottom: 24,
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: { 
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
    },
    button: { 
        backgroundColor: '#3A86FF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: { 
        backgroundColor: '#93C5FD',
        elevation: 0,
    },
    buttonText: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
});

export default ForgotPasswordScreen;