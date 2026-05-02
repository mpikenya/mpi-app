import { Tabs } from "expo-router";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // This is fine, we will override it for the chat screen
        tabBarActiveTintColor: "#0284C7", 
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white",
          height: 70,
          paddingBottom: 30,
          marginBottom: 40,
          padding: 30,
          position: "absolute",
          borderTopWidth: 0,
          overflow: "hidden",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="News"
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="article" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color, size }) => (
            <Feather name="image" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Volunteer"
        options={{
          title: "Volunteer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Donate"
        options={{
          title: "Donate",
          tabBarIcon: ({ color, size }) => (
            <Feather name="dollar-sign" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color, size }) => (
            <Feather name="phone" size={size} color={color} />
          ),
        }}
      />

      {/***********************************************}
      {/*         ADD THIS NEW SCREEN ENTRY           */}
      {/***********************************************/}
      <Tabs.Screen
        // This MUST match the file name: ChatbotScreen.tsx
        name="ChatbotScreen"
        options={{
          // This is the magic line that hides the tab from the bottom bar
          href: null,

          // This overrides the global setting to show a header ONLY for this screen
          headerShown: true,

          // This sets the title that will appear in the new header
          title: "MPI Assistant",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}