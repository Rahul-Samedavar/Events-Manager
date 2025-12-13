import { Image } from "expo-image"; // If you use standard RN Image, change this import
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { isDarkTheme } from "@/hooks/use-theme-color";

export type Event = {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  department: string;
  image: any;
  description: string;
};

export type EventCardTheme =
  | "gold"
  | "midnight"
  | "emerald"
  | "crimson"
  | "glass";

/* ================= Default Event ================= */
export const defaultEvent: Event = {
  id: "default",
  title: "Keynote: The Future of AI",
  time: "10:30 AM – 11:30 AM",
  date: "3rd Jul",
  location: "SDJ Auditorium",
  department: "Cultural",
  image: require("@/assets/event-placeholder.png"), // Update with your asset path
  description:
    "Join us for an inspiring talk on the evolving landscape of artificial intelligence and its impact on everyday life.",
};

/* ================= Themes ================= */
const DARK_SURFACE = "#1A1A1A";

const THEMES = {
  gold: {
    light: {
      bg: "#BF9B30",
      border: "#bc8e0497",
      accent: "#FDFBD4",
      desc: "#ffffff",
      gloss: "rgba(255,255,255,0.5)",
    },
    dark: {
      bg: DARK_SURFACE,
      border: "#DBC15A",
      accent: "#DBC15A",
      desc: "#ffffff",
      gloss: "rgba(255,255,255,0.3)",
    },
  },
  midnight: {
    light: {
      bg: "#0E1628",
      border: "#2B3A67",
      accent: "#E6ECFF",
      desc: "#E6ECFF",
      gloss: "rgba(220,230,255,0.4)",
    },
    dark: {
      bg: DARK_SURFACE,
      border: "#7A8BFF",
      accent: "#9FB2FF",
      desc: "#E6ECFF",
      gloss: "rgba(180,200,255,0.25)",
    },
  },
  emerald: {
    light: {
      bg: "#0F3D2E",
      border: "#2FA97C",
      accent: "#DFF6EE",
      desc: "#E9FFF8",
      gloss: "rgba(180,255,220,0.4)",
    },
    dark: {
      bg: DARK_SURFACE,
      border: "#34CFA0",
      accent: "#63D9B5",
      desc: "#E9FFF8",
      gloss: "rgba(160,255,220,0.25)",
    },
  },
  crimson: {
    light: {
      bg: "#4A0E14",
      border: "#D64550",
      accent: "#FFE6E8",
      desc: "#FFEFF1",
      gloss: "rgba(255,180,200,0.45)",
    },
    dark: {
      bg: DARK_SURFACE,
      border: "#E75A67",
      accent: "#FF9BA5",
      desc: "#FFEFF1",
      gloss: "rgba(255,180,200,0.3)",
    },
  },
  glass: {
    light: {
      bg: "rgba(240,240,240,0.6)",
      border: "rgba(0,0,0,0.18)",
      accent: "#1A1A1A",
      desc: "#2A2A2A",
      gloss: "rgba(255,255,255,0.6)",
    },
    dark: {
      bg: "rgba(20,20,20,0.6)",
      border: "rgba(255,255,255,0.25)",
      accent: "#FFFFFF",
      desc: "#EDEDED",
      gloss: "rgba(255,255,255,0.35)",
    },
  },
} as const;

type Props = {
  event?: Event;
  theme?: EventCardTheme;
};

export default function EventCard({
  event = defaultEvent,
  theme = "gold",
}: Props) {
  const isDark = isDarkTheme();
  const activeTheme = THEMES[theme][isDark ? "dark" : "light"];

  /* ================= State ================= */
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  /* ================= Animated Values ================= */
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ================= Interaction Handlers ================= */
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const onMove = (e: any) => {
    if (Platform.OS !== "web") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = (x / rect.width - 0.5) * 30;
    const dy = (y / rect.height - 0.5) * -30;

    Animated.parallel([
      Animated.spring(rotateX, {
        toValue: dy,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(rotateY, {
        toValue: dx,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  };

  const resetHover = () => {
    if (Platform.OS !== "web") return;
    Animated.parallel([
      Animated.spring(rotateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(rotateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const onPressIn = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 5,
    }).start();

    if (Platform.OS === "web") return;

    const { locationX, locationY } = e.nativeEvent;
    const { width, height } = layout;

    if (width === 0 || height === 0) return;

    const normalizedX = (locationX / width - 0.5) * 2;
    const normalizedY = (locationY / height - 0.5) * 2;

    const xTilt = normalizedY * -15;
    const yTilt = normalizedX * 15;

    Animated.parallel([
      Animated.spring(rotateX, {
        toValue: xTilt,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }),
      Animated.spring(rotateY, {
        toValue: yTilt,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

    if (Platform.OS === "web") return;

    Animated.parallel([
      Animated.spring(rotateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(rotateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();
  };

  /* ================= Interpolations ================= */
  const glossTranslateX = rotateY.interpolate({
    inputRange: [-20, 20],
    outputRange: [280, -280],
    extrapolate: "clamp",
  });

  const glossOpacity = rotateY.interpolate({
    inputRange: [-20, 0, 20],
    outputRange: [1, 0.3, 1],
    extrapolate: "clamp",
  });

  const cardTransform = {
    transform: [
      { perspective: 1000 },
      { scale: scaleAnim },
      {
        rotateX: rotateX.interpolate({
          inputRange: [-20, 20],
          outputRange: ["-20deg", "20deg"],
        }),
      },
      {
        rotateY: rotateY.interpolate({
          inputRange: [-20, 20],
          outputRange: ["-20deg", "20deg"],
        }),
      },
    ],
  };

  const imageTransform = {
    transform: [
      {
        translateY: rotateX.interpolate({
          inputRange: [-20, 20],
          outputRange: [-12, 12],
        }),
      },
      {
        translateX: rotateY.interpolate({
          inputRange: [-20, 20],
          outputRange: [12, -12],
        }),
      },
    ],
  };

  const glossTransform = {
    transform: [{ rotateZ: "25deg" }, { translateX: glossTranslateX }],
    opacity: glossOpacity,
  };

  /* ================= Styles ================= */
  const S = StyleSheet.create({
    card: {
      width: "100%", // FIXED: Ensures it fits mobile padding logic
      maxWidth: 350,
      backgroundColor: activeTheme.bg,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: activeTheme.border,
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      overflow: "hidden",
    },
    // FIXED: Removed 'flex: 1'. Content now dictates height, preventing vertical stretch.
    content: {
      // Intentionally empty or just padding adjustments if needed
    },
    image: {
      height: 160,
      borderRadius: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: activeTheme.border,
      backgroundColor: "#333", // Fallback color
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: activeTheme.accent,
      marginBottom: 4,
    },
    dept: {
      fontSize: 15,
      color: activeTheme.accent,
      fontWeight: "600",
      textAlign: "right",
    },
    desc: {
      marginTop: 8,
      color: activeTheme.desc,
      lineHeight: 22,
      textAlign: "justify",
      marginBottom: 8,
    },
    label: {
      fontSize: 11,
      color: activeTheme.accent,
      fontWeight: "600",
    },
    gloss: {
      position: "absolute",
      width: 60,
      height: "200%",
      top: "-50%",
      left: "50%",
      marginLeft: -30,
      backgroundColor: activeTheme.gloss,
      zIndex: 10,
      shadowColor: "#FFF",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 5,
    },
  });

  return (
    <Link href={`/events/${event.id}`} asChild>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          style={[S.card, cardTransform]}
          onLayout={handleLayout}
          onMouseMove={onMove}
          onMouseLeave={resetHover}
        >
          <Animated.View
            style={[S.gloss, glossTransform]}
            pointerEvents="none"
          />

          <View style={S.content} pointerEvents="none">
            <Animated.View style={imageTransform}>
              <Image
                source={event.image}
                style={S.image}
                contentFit="cover" // For expo-image
                // @ts-ignore: React Native Image prop fallback
                resizeMode="cover" 
              />
            </Animated.View>

            <Text style={S.title}>{event.title}</Text>
            <Text style={S.dept}>{event.department}</Text>
            <Text style={S.desc}>{event.description}</Text>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={S.label}>{event.date}</Text>
              <Text style={S.label}>{event.time}</Text>
              <Text style={S.label}>{event.location}</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
}