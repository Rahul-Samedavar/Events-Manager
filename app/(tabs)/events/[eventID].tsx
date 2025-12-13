import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown, { RenderRules } from "react-native-markdown-display";

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
  // Status specific colors
  status: {
    live: "#E74C3C", // Red
    ended: "#7F8C8D", // Grey
    soon: "#F39C12", // Orange
    upcoming: "#27AE60", // Green
  },
};

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDark = isDarkTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  // Use state for current time to ensure 'Live' status updates if the user stays on the page
  const [now, setNow] = useState(new Date());

  const event = EVENTS.find((e) => e.id === id);

  useEffect(() => {
    // Optional: Update time every minute to keep status accurate
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Logic: Get Status Tag ---
  const getEventStatus = (startStr: Date, endStr: Date) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = start.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHrs / 24);

    if (now > end) {
      return { label: "Ended", color: COLORS.status.ended, icon: "flag" };
    }
    if (now >= start && now <= end) {
      return { label: "Live", color: COLORS.status.live, icon: "radio" };
    }
    if (diffHrs < 0.5 && diffHrs > 0) {
      return {
        label: "About to start",
        color: COLORS.status.soon,
        icon: "time",
      };
    }
    if (diffHrs < 24 && diffHrs > 0) {
      // Handle singular/plural
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

  if (!event) return null; // Or your error view

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
    <SafeAreaView style={[S.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#fff",
          headerBackTitleVisible: false,
        }}
      />
      <StatusBar barStyle="light-content" />

      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={S.imageContainer}>
          <Image
            source={event.image}
            style={S.image}
            contentFit="cover"
            transition={500}
          />
          <View style={S.imageOverlay} />
        </View>

        <View style={[S.contentContainer, { backgroundColor: theme.bg }]}>
          <View style={S.header}>
            {/* Top Row: Department + Status Badge */}
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
                  {/* The '20' adds transparency to the background color */}
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
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
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
    justifyContent: "space-between", // Pushes dept to left, badge to right
    marginBottom: 8,
  },
  dept: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },

  // New Status Badge Styles
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

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
