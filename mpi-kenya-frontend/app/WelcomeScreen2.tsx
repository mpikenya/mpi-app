import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import styles from './indexScreen.styles';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// Define particle type
type ParticleConfig = {
  id: number;
  size: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  initialOpacity: number;
  initialScale: number;
};

// Create separate Particle component
const Particle = (config: ParticleConfig) => {
  const opacity = useSharedValue(config.initialOpacity);
  const scale = useSharedValue(config.initialScale);
  const yTranslate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(config.initialOpacity * 1.5, { duration: 3000 }),
        withTiming(config.initialOpacity, { duration: 3000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(config.initialScale * 1.2, { duration: 2000 }),
        withTiming(config.initialScale, { duration: 2000 })
      ),
      -1,
      true
    );

    yTranslate.value = withRepeat(
      withSequence(
        withTiming(config.direction * 10, {
          duration: config.speed * 100,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: config.speed * 100,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: yTranslate.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          left: config.x,
          top: config.y,
        },
        particleStyle,
      ]}
    />
  );
};

export default function WelcomeScreen2() {
  const router = useRouter();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const birdPosition = useSharedValue(0);
  const birdRotation = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);
  const sloganTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);

  // Initialize particles
  const particleConfigs = useMemo(() => {
    return Array(20).fill(0).map((_, i) => ({
      id: i,
      size: Math.random() * 15 + 5,
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 30 + 10,
      direction: Math.random() < 0.5 ? -1 : 1,
      initialOpacity: Math.random() * 0.3 + 0.2,
      initialScale: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  useEffect(() => {
    titleOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    titleScale.value = withSpring(1, { damping: 10 });

    birdPosition.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    birdRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    setTimeout(() => {
      sloganOpacity.value = withTiming(1, { duration: 1000 });
      sloganTranslateY.value = withSpring(0, { damping: 15 });
    }, 500);

    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 800 });
      buttonScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }, 1000);
  }, []);

  const handlePress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 5 })
    );
    router.push("/SignScreen");
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const birdAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: birdPosition.value },
      { rotate: `${birdRotation.value}deg` },
    ],
  }));

  const sloganAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
    transform: [{ translateY: sloganTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <LinearGradient
      colors={["#0284c7", "#0ea5e9", "#38bdf8"]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Render particles */}
      {particleConfigs.map((config) => (
        <Particle key={config.id} {...config} />
      ))}

      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={styles.organizationTitle}>Mathare Peace Initiative</Text>
        <Text style={styles.countryTitle}>Kenya</Text>
      </Animated.View>

      <Animated.View style={[styles.imageContainer, birdAnimatedStyle]}>
        <Image
          source={require("../assets/images/bird-peace.png")}
          style={styles.birdImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.sloganContainer, sloganAnimatedStyle]}>
        <Text style={styles.sloganText}>
          <Text style={styles.emphasis}>PEACE</Text>
          {"\n"}
          BEGINS WITH{"\n"}
          <Text style={styles.emphasis}>US</Text>
        </Text>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Hop in Now </Text>
          <Feather name="arrow-right" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}
