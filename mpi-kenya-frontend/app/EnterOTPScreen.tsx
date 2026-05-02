import React, { useState, useRef, useEffect } from 'react';
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
    Pressable // Using Pressable to handle focus
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import config from '../constants/config';
import { useRouter, useLocalSearchParams } from 'expo-router';

// As per your request, we assume these images are in the assets/images folder
const MpiLogo = require('../assets/images/mpi-logo.jpeg');
const OtpIllustration = require('../assets/images/otp-img.png');

const EnterOTPScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState(30);

    const otpInputRef = useRef<TextInput>(null);
    const OTP_LENGTH = 6; // The original code expects a 6-digit OTP

    // Timer logic for the "Resend OTP" button
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [resendDisabled]); // Reruns the effect if the resend button is used

    const handleResendOtp = async () => {
        // Here you would add logic to call your resend OTP API endpoint
        Toast.show({ type: 'info', text1: 'Requesting new code...' });
        // For demonstration, we just reset the timer
        setResendDisabled(true);
        setTimer(30);
    };

    const handleSubmit = async () => {
        if (otp.length !== OTP_LENGTH) {
            Toast.show({ type: 'error', text1: 'Invalid Code', text2: `Please enter the ${OTP_LENGTH}-digit code.` });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/verify-otp`, { email, otp });
            const { resetPasswordToken } = response.data;

            Toast.show({ type: 'success', text1: 'Verification Successful!' });
            
            router.push({
                pathname: './ResetPasswordScreen',
                params: { resetToken: resetPasswordToken }
            });

        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: error.response?.data?.message || 'The code is incorrect. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // This renders the individual OTP boxes based on the `otp` state
    const renderOtpInputs = () => {
        const inputs = [];
        for (let i = 0; i < OTP_LENGTH; i++) {
            inputs.push(
                <View key={i} style={[styles.otpBox, otp[i] && styles.otpBoxFilled]}>
                    <Text style={styles.otpText}>{otp[i] || ''}</Text>
                </View>
            );
        }
        return inputs;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.container}>
                    <Image source={MpiLogo} style={styles.logo} />
                    <Image source={OtpIllustration} style={styles.illustration} />
                    
                    <Text style={styles.title}>OTP Verification</Text>
                    <Text style={styles.subtitle}>
                        We sent a verification code to your email address <Text style={styles.emailText}>{email}</Text>.
                    </Text>

                    {/* This Pressable focuses the hidden TextInput when tapped */}
                    <Pressable onPress={() => otpInputRef.current?.focus()} style={styles.otpContainer}>
                        {renderOtpInputs()}
                    </Pressable>
                    
                    {/* Hidden TextInput to capture input while showing the boxes above */}
                    <TextInput
                        ref={otpInputRef}
                        style={styles.hiddenInput}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={OTP_LENGTH}
                        caretHidden={true} // Hides the blinking cursor
                    />

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {resendDisabled ? (
                            <Text style={styles.timerText}>Resend in 00:{timer < 10 ? `0${timer}` : timer}</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResendOtp}>
                                <Text style={styles.resendButtonText}>Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, (loading || otp.length !== OTP_LENGTH) && styles.buttonDisabled]} 
                        onPress={handleSubmit} 
                        disabled={loading || otp.length !== OTP_LENGTH}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Proceed</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollView: { flexGrow: 1, justifyContent: 'center' },
    container: { flex: 1, alignItems: 'center', padding: 24 },
    logo: {
        width: 200,
        height: 130,
        resizeMode: 'contain',
        marginTop: 40,
    },
    illustration: {
        width: 250,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937', // Dark Gray
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280', // Medium Gray
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    emailText: {
        fontWeight: '600',
        color: '#3A86FF', // Main Blue Color
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    otpBox: {
        width: 48,
        height: 52,
        borderWidth: 1,
        borderColor: '#D1D5DB', // Light Gray
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxFilled: {
        borderColor: '#3A86FF', // Main Blue Color
        backgroundColor: '#EFF6FF', // Light Blue
    },
    otpText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    resendText: {
        fontSize: 14,
        color: '#6B7280',
    },
    resendButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3A86FF', // Main Blue Color
    },
    timerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF', // Gray for disabled timer
    },
    button: {
        backgroundColor: '#3A86FF', // Main Blue Color
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
        backgroundColor: '#93C5FD', // Lighter Blue for disabled state
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EnterOTPScreen;