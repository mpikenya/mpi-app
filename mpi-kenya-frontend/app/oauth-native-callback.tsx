import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession(); // Required at the top level

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Wait briefly, then redirect to your home screen or auth-check screen
    const timer = setTimeout(() => {
      router.replace("/(tabs)/Home"); // Or wherever you want to go after login
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
