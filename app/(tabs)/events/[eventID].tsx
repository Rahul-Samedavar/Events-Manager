import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown, { RenderRules } from "react-native-markdown-display";
// Use Safe Area Context for precise Android notches
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock Data Import
import { isDarkTheme } from "@/hooks/use-theme-color";
import { EVENTS } from "@/libs/events";

// Theme Colors
const COLORS = {
  light: {
    bg: "#FFFFFF",
    text: "#1A1A1A",
    muted: "#666666",
    primary: "#BF9B30",
    card: "#F5F5F5",
    border: "#E0E0E0",
    codeBg: "#ECECEC",
  },
  dark: {
    bg: "#121212",
    text: "#EEEEEE",
    muted: "#AAAAAA",
    primary: "#DBC15A",
    card: "#1E1E1E",
    border: "#333333",
    codeBg: "#333333",
  },
  status: {
    live: "#E74C3C",
    ended: "#7F8C8D",
    soon: "#F39C12",
    upcoming: "#27AE60",
  },
};

const STORAGE_KEY = "bookmarked_events";

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Get notch heights
  const isDark = isDarkTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [now, setNow] = useState(new Date());
  const [isBookmarked, setIsBookmarked] = useState(false);

  const event = EVENTS.find((e) => e.id === id);

  // 1. Check Storage on Load
  useEffect(() => {
    checkBookmarkStatus();
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [id]);

  const checkBookmarkStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const bookmarks = stored ? JSON.parse(stored) : [];
      setIsBookmarked(bookmarks.includes(String(id)));
    } catch (error) {
      console.error("Storage Error", error);
    }
  };

  // 2. Toggle Logic
  const toggleBookmark = async () => {
    try {
      const newStatus = !isBookmarked;
      setIsBookmarked(newStatus); // Optimistic UI update

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let bookmarks = stored ? JSON.parse(stored) : [];
      const eventId = String(id);

      if (newStatus) {
        if (!bookmarks.includes(eventId)) bookmarks.push(eventId);
        Alert.alert("Saved", "Event added to your bookmarks.");
      } else {
        bookmarks = bookmarks.filter((savedId: string) => savedId !== eventId);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      Alert.alert("Error", "Could not save bookmark.");
      setIsBookmarked(!isBookmarked); // Revert
    }
  };

  // --- Helpers ---
  const getEventStatus = (startStr: Date, endStr: Date) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = start.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHrs / 24);

    if (now > end)
      return { label: "Ended", color: COLORS.status.ended, icon: "flag" };
    if (now >= start && now <= end)
      return { label: "Live", color: COLORS.status.live, icon: "radio" };
    if (diffHrs < 0.5 && diffHrs > 0)
      return {
        label: "About to start",
        color: COLORS.status.soon,
        icon: "time",
      };
    if (diffHrs < 24 && diffHrs > 0) {
      const hrs = Math.ceil(diffHrs);
      return {
        label: `${hrs} ${hrs === 1 ? "hour" : "hours"} left`,
        color: theme.primary,
        icon: "hourglass",
      };
    }
    return {
      label: `${diffDays} days left`,
      color: theme.primary,
      icon: "calendar",
    };
  };

  const status = event ? getEventStatus(event.fromdate, event.todate) : null;

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeRange = (start: Date, end: Date) => {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return `${start.toLocaleTimeString(
      "en-US",
      timeOptions
    )} - ${end.toLocaleTimeString("en-US", timeOptions)}`;
  };

  const addToCalendar = async () => {
    if (!event) return;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "We need calendar access to save this event."
        );
        return;
      }
      let calendarId;
      if (Platform.OS === "ios") {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );
        const defaultCalendar =
          calendars.find((cal) => cal.isPrimary) || calendars[0];
        calendarId = defaultCalendar?.id;
      }
      if (!calendarId) return;

      await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate: new Date(event.fromdate),
        endDate: new Date(event.todate),
        location: event.location,
        notes: event.description,
        timeZone: "GMT",
      });
      Alert.alert("Success", "Event added to your calendar!");
    } catch (e) {
      Alert.alert("Error", "Failed to add event to calendar.");
    }
  };

  if (!event) return null;

  const markdownStyles = StyleSheet.create({
    body: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 26,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    heading1: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "800",
      marginTop: 24,
      marginBottom: 12,
    },
    heading2: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "700",
      marginTop: 20,
      marginBottom: 10,
    },
    paragraph: { marginTop: 8, marginBottom: 8 },
    link: {
      color: theme.primary,
      textDecorationLine: "underline",
      fontWeight: "600",
    },
    list_item: { color: theme.text, marginVertical: 4, flexDirection: "row" },
    blockquote: {
      backgroundColor: theme.card,
      borderLeftColor: theme.primary,
      borderLeftWidth: 4,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 4,
      marginVertical: 12,
    },
    code_inline: {
      backgroundColor: theme.codeBg,
      color: theme.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      fontSize: 14,
    },
    fence: {
      backgroundColor: theme.card,
      color: theme.text,
      padding: 12,
      borderRadius: 8,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      fontSize: 13,
      borderWidth: 1,
      borderColor: theme.border,
      marginVertical: 12,
    },
  });

  const markdownRules: RenderRules = {
    image: (node, children, parent, styles) => (
      <Image
        key={node.key}
        source={node.attributes.src}
        style={{
          width: "100%",
          height: 220,
          borderRadius: 12,
          marginVertical: 12,
          backgroundColor: theme.card,
        }}
        contentFit="cover"
        transition={500}
      />
    ),
  };

  return (
    <View style={[S.container, { backgroundColor: theme.bg }]}>
      {/* 
        1. HIDE DEFAULT HEADER 
        We are making our own to guarantee it works on Android 
      */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />

      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <View style={S.imageContainer}>
          <Image
            source={event.image}
            style={S.image}
            contentFit="cover"
            transition={500}
          />
          <View style={S.imageOverlay} />
        </View>

        {/* Content */}
        <View style={[S.contentContainer, { backgroundColor: theme.bg }]}>
          <View style={S.header}>
            <View style={S.headerTopRow}>
              <Text style={[S.dept, { color: theme.primary }]}>
                {event.department.toUpperCase()}
              </Text>

              {status && (
                <View
                  style={[
                    S.statusBadge,
                    {
                      backgroundColor: status.color + "20",
                      borderColor: status.color,
                    },
                  ]}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={12}
                    color={status.color}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[S.statusText, { color: status.color }]}>
                    {status.label.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[S.title, { color: theme.text }]}>{event.title}</Text>
          </View>

          <View
            style={[
              S.metaContainer,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={S.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.primary}
              />
              <View style={S.metaTextCol}>
                <Text style={[S.metaLabel, { color: theme.text }]}>
                  {formatDateFull(event.fromdate)}
                </Text>
                <Text style={[S.metaSubLabel, { color: theme.muted }]}>
                  {formatTimeRange(event.fromdate, event.todate)}
                </Text>
              </View>
            </View>
            <View style={[S.divider, { backgroundColor: theme.border }]} />
            <View style={S.metaRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.primary}
              />
              <View style={S.metaTextCol}>
                <Text style={[S.metaLabel, { color: theme.text }]}>
                  {event.location}
                </Text>
                <Text style={[S.metaSubLabel, { color: theme.muted }]}>
                  Venue
                </Text>
              </View>
            </View>
          </View>

          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: theme.text }]}>
              About Event
            </Text>
            <Markdown style={markdownStyles} rules={markdownRules}>
              {event.markdown}
            </Markdown>
          </View>
        </View>
      </ScrollView>

      {/* 
        2. CUSTOM FLOATING HEADER 
        This is placed AFTER ScrollView, so it floats on top (z-index).
        It uses 'insets.top' so it never gets hidden behind the Android notch.
      */}
      <View style={[S.customHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={S.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmark} style={S.iconButton}>
          <Ionicons
            name={isBookmarked ? "heart" : "heart-outline"}
            size={24}
            color={isBookmarked ? "#FF4B4B" : "#FFF"}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          S.footer,
          { backgroundColor: theme.bg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[S.calendarBtn, { backgroundColor: theme.primary }]}
          onPress={addToCalendar}
          activeOpacity={0.8}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={isDark ? "#000" : "#FFF"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[S.calendarBtnText, { color: isDark ? "#000" : "#FFF" }]}
          >
            Add to Calendar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
  // --- New Custom Header Styles ---
  customHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100, // Forces it on top of everything
    // No background color, so it's transparent
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)", // Semi-transparent black bubble
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)", // Nice blur effect on iOS/Web
  },
  // -----------------------------
  imageContainer: { height: 300, width: "100%", position: "relative" },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  contentContainer: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    minHeight: 500,
  },
  header: { marginBottom: 20 },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dept: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
  metaContainer: {
    flexDirection: "column",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaTextCol: { marginLeft: 12, flex: 1 },
  metaLabel: { fontSize: 16, fontWeight: "600" },
  metaSubLabel: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, width: "100%" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  calendarBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarBtnText: { fontSize: 16, fontWeight: "700" },
});
