// app/(tabs)/ChatbotScreen.tsx (Complete Code)

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import config from '../../constants/config';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Type safety ---
interface Message { id: string; text: string; sender: 'user' | 'bot'; }

// ✅ --- FULL CHATMESSAGE COMPONENT --- ✅
const ChatMessage = React.memo(({ item }: { item: Message }) => (
  <View style={[styles.chatBubble, item.sender === 'bot' ? styles.chatBubbleBot : styles.chatBubbleUser]}>
    <Text style={item.sender === 'bot' ? styles.chatBubbleText : styles.chatBubbleTextUser}>
      {item.text}
    </Text>
  </View>
));

const ChatbotScreen = () => {
  const chatListRef = useRef<FlatList<Message> | null>(null);

  // ✅ --- FULL INITIAL MESSAGES STATE --- ✅
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi 👋 I am MathareForPeace-GPT. How can I help you learn about the Mathare Peace Initiative today?', sender: 'bot' }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ --- FULL HANDLESEND FUNCTION --- ✅
// In ChatbotScreen.tsx

// In ChatbotScreen.tsx

const handleSend = async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: userInput.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiUrl = `${config.BASE_URL}/api/chatbot`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      // We expect a simple JSON object now
      const data = await response.json();
      
      if (data.reply) {
        const botMessage: Message = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle cases where the reply is empty
        const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "I received a response, but it was empty.", sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderChatItem = useCallback(({ item }: { item: Message }) => <ChatMessage item={item} />, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} /> 

      <LinearGradient
        colors={['#0ea5e9', '#0284c7']}
        style={styles.header}
      >
        <Image
          source={require("../../assets/images/ai-robot.jpg")}
          style={styles.headerAvatar}
        />
        <View>
          <Text style={styles.headerTitle}>MathareForPeace-GPT</Text>
          <Text style={styles.headerStatus}>We are online!</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={chatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 10 }} color="#0ea5e9" /> : null}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your message..."
            placeholderTextColor="#94a3b8"
            value={userInput}
            onChangeText={setUserInput}
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isLoading}>
            <Feather name="send" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.poweredBy}>
          POWERED BY <Text style={{ fontWeight: "bold", color: "#475569" }}>GEMINI</Text>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284c7', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  chatBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    elevation: 1,
  },
  chatBubbleBot: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderTopLeftRadius: 5,
    borderColor: '#e2e8f0', // Adding a subtle border for depth
    borderWidth: 1,
  },
  chatBubbleUser: {
    backgroundColor: "#0ea5e9",
    alignSelf: "flex-end",
    borderTopRightRadius: 5,
  },
  chatBubbleText: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  chatBubbleTextUser: {
    fontSize: 16,
    color: "white",
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#0f172a',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  poweredBy: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    paddingBottom: 5,
    backgroundColor: 'white',
  },
});

export default ChatbotScreen;