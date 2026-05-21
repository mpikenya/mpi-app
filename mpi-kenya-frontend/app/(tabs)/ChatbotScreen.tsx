import React, { useState, useRef, useCallback, useEffect } from "react";
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
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack,  router } from "expo-router";
import axios from "axios"; // Use axios for consistency
import config from "../../constants/config";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

// eslint-disable-next-line react/display-name
const ChatMessage = React.memo(({ item }: { item: Message }) => (
  <View
    style={[
      styles.chatBubble,
      item.sender === "bot" ? styles.chatBubbleBot : styles.chatBubbleUser,
    ]}
  >
    <Text
      style={
        item.sender === "bot"
          ? styles.chatBubbleText
          : styles.chatBubbleTextUser
      }
    >
      {item.text}
    </Text>
  </View>
));

const ChatbotScreen = () => {
  const insets = useSafeAreaInsets();
  const chatListRef = useRef<FlatList<Message> | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi 👋 I am MathareForPeace-GPT. How can I help you learn about the Mathare Peace Initiative today?",
      sender: "bot",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Monitor connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (userInput.trim() === "" || isLoading) return;

    if (!isConnected) {
      const offlineMsg: Message = {
        id: Date.now().toString(),
        text: "You are currently offline. Please check your internet connection.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, offlineMsg]);
      return;
    }

    const userText = userInput.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.BASE_URL}/api/chatbot`, {
        message: userText,
      });

      if (response.data && response.data.reply) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.reply,
          sender: "bot",
        };
        setMessages((prev) => [...prev, botMessage]);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChatItem = useCallback(
    ({ item }: { item: Message }) => <ChatMessage item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#0ea5e9", "#0284c7"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        {/* ADD THIS BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/Home")}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={require("../../assets/images/ai-robot.jpg")}
          style={styles.headerAvatar}
        />
        <View>
          <Text style={styles.headerTitle}>MathareForPeace-GPT</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#4ade80" : "#f87171" },
              ]}
            />
            <Text style={styles.headerStatus}>
              {isConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingContainer}
      >
        <FlatList
          ref={chatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() =>
            chatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0ea5e9" />
                <Text style={styles.loadingText}>GPT is typing...</Text>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Platform.OS === "ios" ? insets.bottom : 10 },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={userInput}
            onChangeText={setUserInput}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!userInput.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isLoading || !userInput.trim()}
          >
            <Feather name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.poweredBy}>
          POWERED BY{" "}
          <Text style={{ fontWeight: "bold", color: "#475569" }}>
            GEMINI AI
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0284c7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  headerStatus: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 20,
  },
  chatBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatBubbleBot: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },
  chatBubbleUser: {
    backgroundColor: "#0ea5e9",
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  chatBubbleText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    fontSize: 15,
    color: "white",
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  textInput: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: "#f1f5f9",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  poweredBy: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
    paddingVertical: 6,
    backgroundColor: "white",
    letterSpacing: 1,
  },
});

export default ChatbotScreen;
