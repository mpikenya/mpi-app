import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  ImageBackground,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import config from "../../constants/config";

// --- Interfaces ---
interface Review {
  id: string;
  name: string;
  text: string;
  image: string; // URL from backend
}

interface Partner {
  id: string;
  name: string;
  description: string;
  image: string; // URL from backend
}

// --- Helper for Greeting ---
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// --- Memoized Review Card Component ---
const ReviewCard = React.memo(({ item }: { item: Review }) => (
  <View style={styles.reviewCard}>
    <View className="flex-row items-center mb-3 flex-wrap">
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require("../../assets/images/admin-pic.png")
        }
        style={styles.reviewAvatar}
      />
      <Text className="text-sky-800 font-semibold text-base flex-1">
        {item.name}
      </Text>
    </View>
    <Text style={styles.reviewText}>“{item.text}”</Text>
  </View>
));

// --- Memoized Partner Card Component ---
const PartnerCard = React.memo(({ item }: { item: Partner }) => (
  <View style={styles.partnerCard}>
    <Image
      source={
        item.image
          ? { uri: item.image }
          : require("../../assets/images/admin-pic.png")
      }
      style={styles.partnerImage}
    />
    <Text style={styles.partnerName}>{item.name}</Text>
    <Text style={styles.partnerDescription}>{item.description}</Text>
  </View>
));

// --- Main Home Screen Component ---
const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // State for UI and Data
  const [modalVisible, setModalVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Partner carousel logic
  const partnersFlatListRef = useRef<FlatList<Partner> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setReviewsLoading(true);
    setPartnersLoading(true);
    try {
      const [reviewsRes, partnersRes] = await Promise.all([
        fetch(`${config.BASE_URL}/api/testimonials`),
        fetch(`${config.BASE_URL}/api/partners`),
      ]);

      const reviewsData = await reviewsRes.json();
      const partnersData = await partnersRes.json();

      // ✅ Map backend response directly
      setReviews(
        reviewsData.map((r: any) => ({
          id: r._id,
          name: r.name,
          text: r.text,
          image: r.imageUrl,
        }))
      );

      setPartners(
        partnersData.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          image: p.imageUrl,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setReviews([]); // fallback empty
      setPartners([]); // fallback empty
    } finally {
      setReviewsLoading(false);
      setPartnersLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Depend on nothing as it's meant to fetch initial data

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Partner Carousel Autoplay Effect ---
  useEffect(() => {
    if (isAutoplay && partners.length > 0) {
      const intervalId = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % partners.length;
          // Ensure ref is not null before scrolling
          if (partnersFlatListRef.current) {
            partnersFlatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isAutoplay, partners]); // Re-run if isAutoplay or partners change

  // --- Handlers ---
  const handleLogout = useCallback(async () => {
    setModalVisible(false);
    await signOut();
    router.replace("/WelcomeScreen2");
  }, [signOut, router]); // Depend on signOut and router

  const renderReviewItem = useCallback(
    ({ item }: { item: Review }) => <ReviewCard item={item} />,
    []
  );

  const renderPartnerItem = useCallback(
    ({ item }: { item: Partner }) => <PartnerCard item={item} />,
    []
  );

  // This useCallback must be defined unconditionally
  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{
        item: Partner;
        key: string;
        index: number | null;
        isViewable: boolean;
        section?: any;
      }>;
      changed: Array<{
        item: Partner;
        key: string;
        index: number | null;
        isViewable: boolean;
        section?: any;
      }>;
    }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0].index !== undefined &&
        viewableItems[0].index !== null
      ) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchData}
          colors={["#0ea5e9"]}
          tintColor={"#0ea5e9"}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>
            {user?.name?.split(" ")[0] || "Peace Builder"} 👋
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {user ? (
            user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarInitials]}>
                <Text style={styles.headerAvatarInitialsText}>
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>
            )
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarGuest]}>
              <Feather name="user" size={24} color="#64748b" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Daily Verse Section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <ImageBackground
          source={require("../../assets/images/my-home-bg.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View style={{ padding: 20 }}>
            <Image
              source={require("../../assets/images/mpi-logo.jpeg")}
              style={{
                width: 160,
                height: 96,
                alignSelf: "center",
                marginBottom: 16,
              }}
              resizeMode="contain"
            />
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#0369A1",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                🌿 Theme verse
              </Text>
              <Text style={{ color: "#334155", fontSize: 14, lineHeight: 22 }}>
                “Blessed are the peacemakers, for they will be called children
                of God.” – Matthew 5:9
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* "Who We Are" Section */}
      <View className="mt-8 px-6">
        <View className="bg-sky-50 rounded-3xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-sky-800 mb-4">
            ✨ Who We Are
          </Text>
          <Text className="text-slate-700 mb-4 leading-relaxed">
            Mathare Peace Initiative (MPI) is a dynamic, youth-led
            Community-Based Organization (CBO) born from the heart of Mathare.
            We are a collective of passionate peacebuilders, mentors, and
            innovators dedicated to transforming our community from within.
          </Text>
          <Text className="text-slate-700 leading-relaxed">
            Our approach is rooted in the belief that lasting peace is built on
            a foundation of empowerment, justice, and opportunity. We work
            hand-in-hand with local youth, harnessing their creativity and
            potential to address systemic challenges and champion non-violent
            solutions. We are more than an organization—we are a movement
            creating a safer, more inclusive future for all.
          </Text>
        </View>
      </View>

      {/* Vision & Mission Section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
        <ImageBackground
          source={require("../../assets/images/home-bg-2.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View className="w-full px-6 py-10">
            <View className="bg-white/80 rounded-2xl p-6">
              <Text className="text-lg font-semibold text-sky-700 mb-3">
                📌 Our Vision
              </Text>
              <Text className="text-slate-700 text-sm mb-5 leading-relaxed">
                To have a fair, just, peaceful human right community for all.
              </Text>

              <Text className="text-lg font-semibold text-sky-700 mb-3">
                🎯 Our Mission
              </Text>
              <Text className="text-slate-700 text-sm leading-relaxed">
                MPI Kenya is dedicated to build lasting peace by reinforcing the
                capacities of societies to overcome deep divisions and to
                address conflict in non-violent ways. We are rooted in local
                realities, drawing strength from alliance of national teams with
                a long-term commitment to building peace in their own societies.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Services Section */}
      <View className="mt-8 px-6">
        <View className="bg-sky-100 rounded-3xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-sky-800 mb-4">
            🕊️ Peacebuilding Services
          </Text>
          <Text className="text-slate-700 mb-2">
            At Mathare Peace Initiative, we are deeply committed to nurturing a
            peaceful, just, and inclusive society. Our peacebuilding services
            include:
          </Text>
          <View className="mb-5 pl-2">
            <Text className="text-sky-700">
              • Community Dialogues & Mediation
            </Text>
            <Text className="text-sky-700">• Conflict Resolution Training</Text>
            <Text className="text-sky-700">
              • Youth Mentorship & Empowerment
            </Text>
            <Text className="text-sky-700">
              • Civic Education & Human Rights Advocacy
            </Text>
            <Text className="text-sky-700">
              • Peace Campaigns and Community Events
            </Text>
          </View>
          <Text className="text-xl font-bold text-sky-800 mb-4">
            💼 Professional & Monetized Services
          </Text>
          <Text className="text-slate-700 mb-2">
            We also provide income-generating services that equip youth with
            practical skills and contribute to sustaining our operations:
          </Text>
          <View className="pl-2">
            <Text className="text-sky-700">
              • Computer Packages Training (Beginner to Advanced)
            </Text>
            <Text className="text-sky-700">
              • Professional Video & Photo Editing
            </Text>
            <Text className="text-sky-700">
              • Branding & Printing (Clothes, Hoodies, Posters)
            </Text>
            <Text className="text-sky-700">
              • Sale of Branded Clothing & Merchandise
            </Text>
            <Text className="text-sky-700">
              • Professional Web & Mobile App Development (Frontend & Backend)
            </Text>
          </View>
        </View>
      </View>

      {/* Member Reviews Section */}
      <View className="mt-10 px-0 mb-5">
        <Text className="text-lg font-semibold text-slate-800 mb-4 px-6">
          💬 What Members Say
        </Text>
        {reviewsLoading ? (
          <ActivityIndicator
            size="large"
            color="#0ea5e9"
            style={{ marginVertical: 20 }}
          />
        ) : reviews.length > 0 ? (
          <FlatList
            horizontal
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderReviewItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              color="#999"
            />
            <Text style={styles.emptyStateText}>No testimonials found</Text>
          </View>
        )}
      </View>

      {/* Partners Swipeable Section */}
      <View style={styles.partnersContainer}>
        <Text style={styles.partnersTitle}>
          🤝 Some of our Esteemed Partners
        </Text>
        {partnersLoading ? (
          <ActivityIndicator
            size="large"
            color="#0ea5e9"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <>
            {/* Always render FlatList, even if partners is empty. It will just be empty. */}
            <FlatList
              ref={partnersFlatListRef}
              horizontal
              data={partners}
              keyExtractor={(item) => item.id}
              renderItem={renderPartnerItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              snapToInterval={280 + 16}
              decelerationRate="fast"
              onScrollEndDrag={() => setIsAutoplay(true)}
              onScrollBeginDrag={() => setIsAutoplay(false)}
              onViewableItemsChanged={onViewableItemsChanged} // Use the unconditionally declared useCallback
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
            />
            {partners.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={40} color="#999" />
                <Text style={styles.emptyStateText}>No partners yet, stay tuned!</Text>
              </View>
            )}
            {/* Pagination dots only if there are partners */}
            {partners.length > 0 && (
              <View style={styles.paginationContainer}>
                {partners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      {
                        backgroundColor:
                          index === activeIndex ? "#0369a1" : "#cbd5e1",
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* CTA Section - Light Blue Theme */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaBackground}>
          <Text style={styles.ctaTitle}>Become a Peacebuilder</Text>
          <Text style={styles.ctaSubtitle}>
            Your support helps us build a more just and peaceful community in
            Mathare and beyond.
          </Text>

          {/* --- Action Card 1: Donate --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Donate")}
          >
            <Feather name="heart" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Donate</Text>
              <Text style={styles.ctaCardDescription}>
                Every contribution makes a difference.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 2: Volunteer --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Volunteer")}
          >
            <Feather name="users" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Volunteer</Text>
              <Text style={styles.ctaCardDescription}>
                Join our team and share your skills.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 3: Contact Us --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Contact")}
          >
            <Feather name="mail" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Contact Us</Text>
              <Text style={styles.ctaCardDescription}>
                Have questions? We’d love to talk.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI CHATBOT LAUNCHER SECTION (Now links to a dedicated screen) */}
      <View style={styles.launcherContainer}>
        <TouchableOpacity
          style={styles.launcherCard}
          onPress={() => router.push("/(tabs)/ChatbotScreen")}
        >
          <Image
            source={require("../../assets/images/ai-robot.jpg")}
            style={styles.launcherAvatar}
          />
          <View style={styles.launcherTextContainer}>
            <Text style={styles.launcherTitle}>Chat with MPI Assistant</Text>
            <Text style={styles.launcherSubtitle}>
              Ask me anything about MPI's mission, services, and how you can
              help.
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            style={styles.launcherArrow}
          />
        </TouchableOpacity>
      </View>

      {/* User Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {user ? (
              <>
                {user.photo ? (
                  <Image
                    source={{ uri: user.photo }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <View style={styles.modalAvatarInitialsContainer}>
                    <Text style={styles.modalAvatarInitialsText}>
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </Text>
                  </View>
                )}
                <Text style={styles.modalUserName}>{user.name}</Text>
                <Text style={styles.modalUserEmail}>{user.email}</Text>
              </>
            ) : (
              <Text style={styles.modalUserName}>Welcome, Guest!</Text>
            )}

            {user && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push("./../Profile");
                }}
              >
                <Feather name="edit-3" size={20} color="#334155" />
                <Text style={styles.modalButtonText}>
                  Edit Profile Picture{" "}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                user ? styles.logoutButton : styles.loginButton,
              ]}
              onPress={handleLogout}
            >
              <Feather
                name={user ? "log-out" : "log-in"}
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonTextWhite}>
                {user ? "Logout" : "Login"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // --- Header Styles ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  greetingContainer: {},
  greetingText: { fontSize: 16, color: "#6B7280" },
  userNameText: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  headerAvatar: { width: 48, height: 48, borderRadius: 24 },
  headerAvatarInitials: {
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarInitialsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  headerAvatarGuest: {
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Review Card Styles ---
  reviewCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#38bdf8",
    marginRight: 12,
    backgroundColor: "#ffffff",
  },
  reviewText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },

  // --- Partners Section Styles ---
  partnersContainer: { marginTop: 40, paddingBottom: 40 },
  partnersTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  partnerCard: {
    width: 280,
    backgroundColor: "#e0f2fe",
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerImage: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    textAlign: "center",
  },
  partnerDescription: {
    fontSize: 13,
    color: "#334155",
    textAlign: "center",
    marginTop: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // --- CTA Section Styles ---
  ctaContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaBackground: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#1e3a8a",
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ctaIcon: { color: "#93c5fd", marginRight: 16 },
  ctaTextContainer: { flex: 1 },
  ctaCardTitle: { fontSize: 16, fontWeight: "600", color: "white" },
  ctaCardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  ctaArrow: { color: "rgba(255, 255, 255, 0.5)" },

  // --- Chatbot Launcher Styles ---
  launcherContainer: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  launcherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff", // Light sky blue to feel inviting
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  launcherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  launcherTextContainer: {
    flex: 1,
  },
  launcherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#075985",
  },
  launcherSubtitle: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
    lineHeight: 18,
  },
  launcherArrow: {
    color: "#94a3b8",
    marginLeft: 10,
  },

  // --- Modal Styles ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  modalAvatarInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalAvatarInitialsText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  modalUserEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
  },
  modalButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  logoutButton: { backgroundColor: "#DC2626" },
  loginButton: { backgroundColor: "#0ea5e9" },
  modalButtonTextWhite: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  emptyStateText: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default HomeScreen;
