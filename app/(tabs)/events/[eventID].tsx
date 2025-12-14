import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications"; // CHANGED: Import Notifications
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal, // Added for the selection menu
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Markdown, { RenderRules } from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock Data Import
import { isDarkTheme } from "@/hooks/use-theme-color";
import { EVENTS } from "@/libs/events";

// --- Notification Handler Configuration ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Added: Required for newer types
    shouldShowList: true, // Added: Required for newer types
  }),
});

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
    modalOverlay: "rgba(0,0,0,0.5)",
  },
  dark: {
    bg: "#121212",
    text: "#EEEEEE",
    muted: "#AAAAAA",
    primary: "#DBC15A",
    card: "#1E1E1E",
    border: "#333333",
    codeBg: "#333333",
    modalOverlay: "rgba(0,0,0,0.7)",
  },
  status: {
    live: "#E74C3C",
    ended: "#7F8C8D",
    soon: "#F39C12",
    upcoming: "#27AE60",
  },
};

const BOOKMARK_KEY = "bookmarked_events";
const REMINDER_KEY_PREFIX = "reminder_event_"; // Key to store scheduled notification ID

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = isDarkTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [now, setNow] = useState(new Date());
  const [isBookmarked, setIsBookmarked] = useState(false);

  // New States for Notifications
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduledNotificationId, setScheduledNotificationId] = useState<
    string | null
  >(null);

  const event = EVENTS.find((e) => e.id === id);

  useEffect(() => {
    checkBookmarkStatus();
    checkReminderStatus(); // Check if we already have a reminder set
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [id]);

  // --- Logic: Bookmarks ---
  const checkBookmarkStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARK_KEY);
      const bookmarks = stored ? JSON.parse(stored) : [];
      setIsBookmarked(bookmarks.includes(String(id)));
    } catch (error) {
      console.error("Storage Error", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const newStatus = !isBookmarked;
      setIsBookmarked(newStatus);
      const stored = await AsyncStorage.getItem(BOOKMARK_KEY);
      let bookmarks = stored ? JSON.parse(stored) : [];
      const eventId = String(id);

      if (newStatus) {
        if (!bookmarks.includes(eventId)) bookmarks.push(eventId);
        Alert.alert("Saved", "Event added to your bookmarks.");
      } else {
        bookmarks = bookmarks.filter((savedId: string) => savedId !== eventId);
      }
      await AsyncStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      setIsBookmarked(!isBookmarked);
    }
  };

  // --- Logic: Notifications ---

  const checkReminderStatus = async () => {
    try {
      const storedId = await AsyncStorage.getItem(REMINDER_KEY_PREFIX + id);
      if (storedId) {
        // Verify if it's still scheduled in system
        const scheduled =
          await Notifications.getAllScheduledNotificationsAsync();
        const exists = scheduled.find((n) => n.identifier === storedId);
        if (exists) {
          setScheduledNotificationId(storedId);
        } else {
          // Clean up dead key
          await AsyncStorage.removeItem(REMINDER_KEY_PREFIX + id);
          setScheduledNotificationId(null);
        }
      }
    } catch (e) {
      console.log("Error checking reminder", e);
    }
  };

  const scheduleNotification = async (minutesBefore: number, label: string) => {
    if (!event) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications to set reminders."
        );
        return;
      }
    }

    const triggerDate = new Date(
      new Date(event.fromdate).getTime() - minutesBefore * 60000
    );

    if (triggerDate <= new Date()) {
      Alert.alert("Invalid Time", "This time has already passed.");
      return;
    }

    try {
      if (scheduledNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          scheduledNotificationId
        );
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming: ${event.title}`,
          body: `Event starts in ${label}. Location: ${event.location}`,
          sound: true,
          data: { eventId: id },
        },
        // FIX: Explicitly define type and date
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      await AsyncStorage.setItem(REMINDER_KEY_PREFIX + id, notificationId);
      setScheduledNotificationId(notificationId);
      setModalVisible(false);

      Alert.alert(
        "Reminder Set",
        `We'll notify you ${label} before the event.`
      );
    } catch (e) {
      Alert.alert("Error", "Failed to schedule notification.");
      console.error(e);
    }
  };

  // NEW: Function to test immediate notification
  const scheduleTestNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }

    // Schedule for 5 seconds from NOW (easier to test than 5 mins)
    // If you strictly want 5 mins, change 5000 to (5 * 60 * 1000)
    const triggerDate = new Date(Date.now() + 5000);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test to ensure notifications work on your device.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      setModalVisible(false);
      Alert.alert(
        "Test Scheduled",
        "You will receive a notification in 5 seconds. Close the app to test background behavior."
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to schedule test.");
    }
  };

  const cancelReminder = async () => {
    if (scheduledNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        scheduledNotificationId
      );
      await AsyncStorage.removeItem(REMINDER_KEY_PREFIX + id);
      setScheduledNotificationId(null);
      setModalVisible(false);
      Alert.alert("Cancelled", "Reminder removed.");
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

  if (!event) return null;

  // --- Markdown Styles (Same as before) ---
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

  // --- Notification Options Data ---
  const notificationOptions = [
    { label: "5 Minutes before", value: 5 },
    { label: "10 Minutes before", value: 10 },
    { label: "30 Minutes before", value: 30 },
    { label: "1 Hour before", value: 60 },
    { label: "1 Day before", value: 1440 },
  ];

  return (
    <View style={[S.container, { backgroundColor: theme.bg }]}>
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

      {/* Floating Header */}
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

      {/* Footer Button */}
      <View
        style={[
          S.footer,
          { backgroundColor: theme.bg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            S.calendarBtn,
            {
              backgroundColor: scheduledNotificationId
                ? theme.card
                : theme.primary,
              borderWidth: scheduledNotificationId ? 2 : 0,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={
              scheduledNotificationId
                ? "notifications"
                : "notifications-outline"
            }
            size={20}
            color={
              scheduledNotificationId ? theme.primary : isDark ? "#000" : "#FFF"
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              S.calendarBtnText,
              {
                color: scheduledNotificationId
                  ? theme.primary
                  : isDark
                  ? "#000"
                  : "#FFF",
              },
            ]}
          >
            {scheduledNotificationId ? "Reminder Set" : "Get Notified"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* REMINDER SELECTION MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={[S.modalOverlay, { backgroundColor: theme.modalOverlay }]}
          >
            <TouchableWithoutFeedback>
              <View style={[S.modalContent, { backgroundColor: theme.bg }]}>
                <View style={S.modalHeader}>
                  <Text style={[S.modalTitle, { color: theme.text }]}>
                    Set Reminder
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.muted} />
                  </TouchableOpacity>
                </View>

                <Text style={[S.modalSubtitle, { color: theme.muted }]}>
                  When do you want to be notified?
                </Text>

                {/* ... inside the Modal View ... */}

                <View style={{ marginTop: 10 }}>
                  {notificationOptions.map((opt, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[S.optionRow, { borderBottomColor: theme.border }]}
                      onPress={() => scheduleNotification(opt.value, opt.label)}
                    >
                      <Text style={[S.optionText, { color: theme.text }]}>
                        {opt.label}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.muted}
                      />
                    </TouchableOpacity>
                  ))}

                  {/* NEW: Test Button */}
                  <TouchableOpacity
                    style={[
                      S.optionRow,
                      {
                        borderBottomColor: theme.border,
                        borderBottomWidth: 0,
                        marginTop: 10,
                      },
                    ]}
                    onPress={scheduleTestNotification}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="bug-outline"
                        size={18}
                        color={theme.primary}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          S.optionText,
                          { color: theme.primary, fontWeight: "700" },
                        ]}
                      >
                        Test System (5 Secs)
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>

                {scheduledNotificationId && (
                  <TouchableOpacity
                    style={[
                      S.cancelBtn,
                      { backgroundColor: COLORS.status.live + "20" },
                    ]}
                    onPress={cancelReminder}
                  >
                    <Ionicons
                      name="notifications-off-outline"
                      size={18}
                      color={COLORS.status.live}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{ color: COLORS.status.live, fontWeight: "600" }}
                    >
                      Turn off Reminder
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
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

  // --- Modal Styles ---
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
    paddingBottom: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalSubtitle: { fontSize: 14, marginBottom: 20 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: { fontSize: 16, fontWeight: "500" },
  cancelBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
});
