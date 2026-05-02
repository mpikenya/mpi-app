import React, { useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    ScrollView, 
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from '../constants/config';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

// --- (1) DEFINE A TYPE for our new state object for clarity ---
interface NewImageInfo {
    uri: string;
    type: string;
    name: string;
}

const ProfileScreen = () => {
    const { user, token, updateUser } = useAuth();
    
    const [isUploading, setIsUploading] = useState(false);
    // --- (2) CHANGE STATE to hold an object, not just a string ---
    const [newImageInfo, setNewImageInfo] = useState<NewImageInfo | null>(null);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Access to the photo library is required.' });
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (pickerResult.canceled) return;

        if (pickerResult.assets && pickerResult.assets.length > 0) {
            const asset = pickerResult.assets[0];

            // --- (3) POPULATE THE NEW STATE OBJECT with rich data from the picker ---
            // Use the mimeType from the picker if available, otherwise guess from the filename.
            const fileType = asset.mimeType || `image/${asset.fileName?.split('.').pop()}`;
            const fileName = asset.fileName || 'profile.jpg'; // Use a default name if none exists

            setNewImageInfo({
                uri: asset.uri,
                type: fileType,
                name: fileName,
            });
        }
    };

    // --- (4) UPDATE uploadImage to accept the new object type ---
    const uploadImage = async (imageInfo: NewImageInfo) => {
        setIsUploading(true);
        const formData = new FormData();

        // Use the properties from the imageInfo object directly
        formData.append('profileImage', {
            uri: imageInfo.uri,
            name: imageInfo.name,
            type: imageInfo.type,
        } as any);

        try {
            const response = await axios.post(
                `${config.BASE_URL}/api/users/profile-picture`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
            );
            updateUser(response.data.user);
            Toast.show({ type: 'success', text1: 'Success!', text2: 'Profile picture updated.' });
            setNewImageInfo(null); // Clear the info object on success
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Please try again.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveChanges = () => {
        // --- (5) CHECK FOR the newImageInfo object ---
        if (newImageInfo) {
            uploadImage(newImageInfo);
        } else {
            Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'You will be able to edit your profile here.' });
        }
    };
    
    if (!user) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#3A86FF" />
            </SafeAreaView>
        );
    }
    
    // --- (6) UPDATE display URI logic to get it from the new state object ---
    const displayImageUri = newImageInfo?.uri || user.photo || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=3A86FF&color=fff&size=128`;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
                        <Image source={{ uri: displayImageUri }} style={styles.avatar} />
                        <View style={styles.editIconContainer}>
                            <Feather name="camera" size={18} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Feather name="user" size={20} color="#6B7280" style={styles.infoIcon} />
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{user.name}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Feather name="mail" size={20} color="#6B7280" style={styles.infoIcon} />
                        <Text style={styles.infoLabel}>Email Address</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, isUploading && styles.buttonDisabled]} 
                        onPress={handleSaveChanges} 
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            // --- (7) UPDATE BUTTON LOGIC to check for newImageInfo ---
                            <Text style={styles.buttonText}>
                                {newImageInfo ? 'Save Profile Picture' : 'Edit Profile'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles remain exactly the same
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#E5E7EB',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#3A86FF',
        padding: 8,
        borderRadius: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    infoSection: {
        width: '90%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    infoIcon: {
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 16,
        color: '#6B7280',
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        textAlign: 'right',
    },
    buttonContainer: {
        width: '90%',
    },
    button: {
        backgroundColor: '#3A86FF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;