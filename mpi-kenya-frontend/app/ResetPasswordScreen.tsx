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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // For icons

// Load images from the assets folder
const MpiLogo = require('../assets/images/mpi-logo.jpeg');
const ResetPasswordIllustration = require('../assets/images/reset-img.png');

const ResetPasswordScreen = () => {
    const router = useRouter();
    const { resetToken } = useLocalSearchParams<{ resetToken: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in both password fields.' });
            return;
        }
        if (password.length < 8) {
            Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must be at least 8 characters long.' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords Do Not Match', text2: 'Please ensure both passwords are the same.' });
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${config.BASE_URL}/api/auth/reset-password`, {
                resetPasswordToken: resetToken,
                password: password,
            });

            Toast.show({ type: 'success', text1: 'Password Reset!', text2: 'Your password has been changed successfully. Please log in.', visibilityTime: 4000 });
            router.replace('/SignScreen'); // Navigate to login
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
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
                    <View style={styles.container}>
                        <Image source={MpiLogo} style={styles.logo} />
                        <Image source={ResetPasswordIllustration} style={styles.illustration} />
                        
                        <Text style={styles.title}>Set a New Password</Text>
                        <Text style={styles.subtitle}>Create a new, secure password. Make sure it's at least 8 characters long.</Text>
                        
                        {/* New Password Input */}
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                                textContentType="newPassword" // Helps with password managers
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm New Password Input */}
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#9CA3AF"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!isConfirmPasswordVisible}
                                textContentType="newPassword"
                            />
                            <TouchableOpacity onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                                <Feather name={isConfirmPasswordVisible ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
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
    logo: {
        width: 200,
        height: 130,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    illustration: {
        width: 260,
        height: 210,
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
        marginBottom: 20,
    },
    inputIcon: {
        paddingLeft: 16,
    },
    eyeIcon: {
        paddingRight: 16,
    },
    input: { 
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
    },
    button: { 
        backgroundColor: '#3A86FF', // Main Blue Color
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: { 
        backgroundColor: '#93C5FD', // Lighter Blue for disabled state
        elevation: 0,
    },
    buttonText: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
});

export default ResetPasswordScreen;