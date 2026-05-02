import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const LoadingGate = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0369A1" />
        </View>
    );
};

export default LoadingGate;