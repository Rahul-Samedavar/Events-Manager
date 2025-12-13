import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import Markdown from "react-native-markdown-display";
import * as Calendar from "expo-calendar";
import { Ionicons } from "@expo/vector-icons";

// Mock Data Import - Replace with your actual data source lookup
import { EVENTS } from "@/libs/events"; // Assuming you have an array of events here
import { isDarkTheme } from "@/hooks/use-theme-color";

// Theme Colors
const COLORS = {
  light: {
    bg: "#FFFFFF",
    text: "#1A1A1A",
    muted: "#666666",
    primary: "#BF9B30", 
    card: "#F5F5F5",
    border: "#E0E0E0",
  },
  dark: {
    bg: "#121212",
    text: "#EEEEEE",
    muted: "#AAAAAA",
    primary: "#DBC15A",
    card: "#1E1E1E",
    border: "#333333",
  },
};


export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDark = isDarkTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  const event = EVENTS.find((e) => e.id === id);

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
    return `${start.toLocaleTimeString("en-US", timeOptions)} - ${end.toLocaleTimeString("en-US", timeOptions)}`;
  };

  // 2. Calendar Reminder Logic
  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  const addToCalendar = async () => {
    if (!event) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "We need calendar access to save this event.");
        return;
      }

      // Get a valid calendar to write to
      let calendarId;
      if (Platform.OS === "ios") {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];
        calendarId = defaultCalendar?.id;
      }

      if (!calendarId) {
        Alert.alert("Error", "Could not find a calendar to save to.");
        return;
      }

      await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate: new Date(event.fromdate),
        endDate: new Date(event.todate),
        location: event.location,
        notes: event.description,
        timeZone: "GMT", // Adjust based on your locale needs
      });

      Alert.alert("Success", "Event added to your calendar!");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to add event to calendar.");
    }
  };

  // Handle Event Not Found
  if (!event) {
    return (
      <View style={[S.container, { backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }]}>
        <Stack.Screen options={{ headerShown: true, title: "Event Not Found" }} />
        <Text style={{ color: theme.text }}>Event not found.{id}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Markdown Styles (Must be defined dynamically for theme support)
  const markdownStyles = {
    body: { color: theme.text, fontSize: 16, lineHeight: 24 },
    heading1: { color: theme.text, marginTop: 20, marginBottom: 10, fontWeight: "bold" },
    heading2: { color: theme.text, marginTop: 15, marginBottom: 10, fontWeight: "bold" },
    link: { color: theme.primary },
    list_item: { color: theme.text, marginVertical: 4 },
    bullet_list_icon: { color: theme.text },
    ordered_list_icon: { color: theme.text },
    blockquote: { backgroundColor: theme.card, borderLeftColor: theme.primary, borderLeftWidth: 4, padding: 10 },
    code_inline: { backgroundColor: theme.card, color: theme.primary, borderRadius: 4 },
    fence: { backgroundColor: theme.card, color: theme.text },
  };

  return (
    <SafeAreaView style={[S.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#fff", // White back button for image overlay
          headerBackTitleVisible: false,
        }}
      />
      <StatusBar barStyle="light-content" />

      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <View style={S.imageContainer}>
          <Image
            source={event.image}
            style={S.image}
            contentFit="cover"
            transition={500}
          />
          {/* Gradient/Overlay for text readability if needed, currently just dimming */}
          <View style={S.imageOverlay} />
        </View>

        {/* Content Container */}
        <View style={[S.contentContainer, { backgroundColor: theme.bg }]}>
          {/* Header Info */}
          <View style={S.header}>
            <Text style={[S.dept, { color: theme.primary }]}>{event.department.toUpperCase()}</Text>
            <Text style={[S.title, { color: theme.text }]}>{event.title}</Text>
          </View>

          {/* Meta Data Row */}
          <View style={[S.metaContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={S.metaRow}>
              <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              <View style={S.metaTextCol}>
                <Text style={[S.metaLabel, { color: theme.text }]}>{formatDateFull(event.fromdate)}</Text>
                <Text style={[S.metaSubLabel, { color: theme.muted }]}>
                  {formatTimeRange(event.fromdate, event.todate)}
                </Text>
              </View>
            </View>

            <View style={[S.divider, { backgroundColor: theme.border }]} />

            <View style={S.metaRow}>
              <Ionicons name="location-outline" size={20} color={theme.primary} />
              <View style={S.metaTextCol}>
                <Text style={[S.metaLabel, { color: theme.text }]}>{event.location}</Text>
                <Text style={[S.metaSubLabel, { color: theme.muted }]}>Venue</Text>
              </View>
            </View>
          </View>

          {/* Description / Markdown */}
          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: theme.text }]}>About Event</Text>
            {/* @ts-ignore: Markdown types can be fussy */}
            <Markdown style={markdownStyles}>
              {event.description}
            </Markdown>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={[S.footer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[S.calendarBtn, { backgroundColor: theme.primary }]}
          onPress={addToCalendar}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={isDark ? "#000" : "#FFF"} style={{ marginRight: 8 }} />
          <Text style={[S.calendarBtnText, { color: isDark ? "#000" : "#FFF" }]}>
            Add to Calendar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  contentContainer: {
    flex: 1,
    marginTop: -30, // Overlap the image
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    minHeight: 500,
  },
  header: {
    marginBottom: 20,
  },
  dept: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: "column",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaTextCol: {
    marginLeft: 12,
  },
  metaLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  metaSubLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area handling manually if needed
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
  calendarBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});