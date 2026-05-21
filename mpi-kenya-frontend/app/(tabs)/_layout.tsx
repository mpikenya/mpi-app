import { Tabs } from "expo-router";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
// Import the safe area hook to detect the height of the Android 3-button navigation
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0284C7",
        tabBarInactiveTintColor: "#64748b", 
        tabBarStyle: {
          backgroundColor: "white",
          // Calculate height dynamically by adding the system's bottom inset
          // This keeps the bar tall enough so system buttons do not overlap tabs
          height: Platform.OS === 'ios' ? 55 + insets.bottom : 60 + insets.bottom, 
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          elevation: 0, 
          shadowOpacity: 0, 
          paddingTop: 10,
          // Shift the interactive icons/labels above the 3 system buttons using safe insets
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, 
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          // Ensure labels are not cut off by the system navigation buttons
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="News"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="article" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => (
            <Feather name="image" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Volunteer"
        options={{
          title: "Volunteer",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Donate"
        options={{
          title: "Donate",
          tabBarIcon: ({ color }) => (
            <Feather name="dollar-sign" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color }) => (
            <Feather name="phone" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ChatbotScreen"
        options={{
          href: null, // Hidden from tab bar
          headerShown: true,
          title: "MPI Assistant",
          tabBarStyle: { display: "none" }, // Hide tab bar when chatting
        }}
      />
    </Tabs>
  );
}