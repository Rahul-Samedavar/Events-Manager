import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- Animated Components ---
// Floating colorful blobs for the "Aura" background
const FloatingBlob = ({ color, size, startX, startY, duration, delay }: any) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-50, { duration: duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(50, { duration: duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(30, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: startY,
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.4,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 40,
        },
        style,
      ]}
    />
  );
};

export default function HomePage() {
  const router = useRouter();

  // Animation values for the button
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);

  useEffect(() => {
    // Subtle breathing glow on the button
    buttonGlow.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSpring(0.9, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate to your Event Details or Event List page
    // Replace '/events' with your actual path (e.g., '/(tabs)/events' or a specific ID)
    router.push('/(tabs)/events'); 
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + buttonGlow.value * 0.3,
    transform: [{ scale: 1 + buttonGlow.value * 0.1 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- Background Aura --- */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#121212', '#000000']}
          style={StyleSheet.absoluteFill}
        />
        {/* Animated Orbs */}
        <FloatingBlob color="#BF9B30" size={300} startX={-50} startY={height * 0.1} duration={6000} />
        <FloatingBlob color="#5D3FD3" size={350} startX={width - 200} startY={height * 0.4} duration={8000} />
        <FloatingBlob color="#BF9B30" size={200} startX={-50} startY={height * 0.7} duration={7000} />
        
        {/* Blur overlay to make it look like gas/aura */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      </View>

      {/* --- Content --- */}
      <View style={styles.content}>
        
        {/* Title Section */}
        <Animated.View entering={FadeIn.duration(1000).delay(300)} style={styles.titleContainer}>
          <Text style={styles.superTitle}>AURA</Text>
          <Text style={styles.subYear}>26</Text>
        </Animated.View>

        <Animated.Text entering={FadeIn.duration(1000).delay(800)} style={styles.tagline}>
          Experience the unknown.
        </Animated.Text>

        {/* Interactive Button */}
        <View style={styles.buttonWrapper}>
          {/* pulsating ring behind button */}
          <Animated.View style={[styles.glowRing, glowStyle]} />
          
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
          >
            <Animated.View style={[styles.mainButton, animatedButtonStyle]}>
              <Text style={styles.buttonText}>ENTER</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </Animated.View>
          </Pressable>
        </View>

        {/* Footer Text */}
        <Animated.View entering={FadeIn.delay(1200)} style={styles.footer}>
          <Text style={styles.footerText}>KLS Gogte Institute of Technology</Text>
          <Text style={styles.footerSubText}>Annual Cultural Fest</Text>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  // Typography
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  superTitle: {
    fontSize: 90,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -2,
    lineHeight: 90,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed',
  },
  subYear: {
    fontSize: 90,
    fontWeight: '300',
    color: '#BF9B30', // Gold accent
    marginTop: -20,
    letterSpacing: -5,
    fontStyle: 'italic',
  },
  tagline: {
    color: '#888',
    fontSize: 16,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 20,
    fontWeight: '600',
  },
  // Button
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    width: 200,
    height: 200, // Large touch area
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#BF9B30',
    backgroundColor: 'rgba(191, 155, 48, 0.1)',
  },
  mainButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 4,
  },
  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerSubText: {
    color: '#444',
    fontSize: 10,
    marginTop: 4,
  }
});