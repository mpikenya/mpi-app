import { StyleSheet, Dimensions, Platform } from "react-native";

// Get screen dimensions once to use throughout the stylesheet
const { width, height } = Dimensions.get("window");

// Create a scaling factor based on the screen width.
// A common base width is 375 (e.g., iPhone 8).
const scale = (size) => (width / 375) * size;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // Use percentage for horizontal padding
    paddingHorizontal: width * 0.05,
    // Keep platform-specific padding for status bar
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },

  header: {
    alignItems: "center",
    // Use margin bottom as a percentage of height
    marginBottom: height * 0.01,
  },

  logo: {
    // Use responsive width and height
    width: width * 0.5, // 50% of screen width
    height: height * 0.1, // 10% of screen height
    resizeMode: "contain",
    // Margin Top can be responsive too
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    // Responsive margin bottom
    marginBottom: height * 0.025,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14, // Vertical padding can often remain fixed
    position: "relative",
  },

  tabText: {
    // Use the scaling factor for fonts
    fontSize: scale(16),
    fontWeight: "600",
    color: "#94a3b8",
  },

  activeTabText: {
    color: "#0ea5e9",
    fontWeight: "700",
  },

  activeIndicator: {
    position: "absolute",
    bottom: -1,
    height: 3,
    width: "100%",
    backgroundColor: "#0ea5e9",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  formContainer: {
    marginBottom: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 15 : 12, // Slightly more padding for iOS
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: scale(15), // Scaled font size
    color: "#0f172a",
  },

  eyeIcon: {
    padding: 5,
    marginLeft: 5,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: "#0ea5e9",
    fontWeight: "400",
    fontSize: scale(13), // Scaled font size
  },

  submitButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    marginTop: 10,
  },

  submitButtonText: {
    color: "white",
    fontSize: scale(16), // Scaled font size
    fontWeight: "700",
    marginRight: 10,
  },

  socialContainer: {
    alignItems: "center",
    // Use responsive margins
    marginTop: 60,
    marginBottom: height * 0.04,
  },

  socialText: {
    color: "#64748b",
    marginBottom: 20,
    fontSize: scale(14), // Scaled font size
  },

  socialButtons: {
    flexDirection: "row",
    justifyContent: "center", // Center the single button
    width: "100%",
  },

  socialButton: {
    // Use responsive sizing for the button itself
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: (width * 0.14) / 2, // Keep it a perfect circle
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 0,
  },

  footer: {
    alignItems: "center",
    marginTop: 0, // Push footer to the bottom
    paddingBottom: height * 0.02, // Give it some space at the very bottom
  },

  footerText: {
    marginBottom: 100,
    fontSize: scale(15), // Scaled font size
    color: "#64748b",
  },

  footerLink: {
    color: "#0ea5e9",
    fontWeight: "700",
  },

   laaButton: {
        width: 60, // Set a fixed width
        height: 60, // Set a fixed height
        borderRadius: 30, // Make it a perfect circle (half of width/height)
        backgroundColor: '#38bdf8', // A nice sky blue color
        justifyContent: 'center', // Center the text vertically
        alignItems: 'center', // Center the text horizontally
        
        // Add a subtle shadow for depth (optional but nice)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    laaText: {
        color: 'white', // White text color
        fontWeight: 'bold', // Make the text bold
        fontSize: 16, // A good font size for the acronym
    },
});

export default styles;