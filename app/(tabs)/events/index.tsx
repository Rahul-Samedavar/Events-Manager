import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router"; // Added useFocusEffect
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState, useCallback } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  Image as RNImage,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import Storage

import { EVENTS } from "@/libs/events";
import EventCard from "@/components/ui/eventcard";

const CATEGORIES = ["All", "Tech", "Cultural", "Music", "Workshop"];
const STORAGE_KEY = "bookmarked_events"; // Must match key in details page

// --- THEME CONFIGURATION ---
const ThemeColors = {
  dark: {
    background: "#121212",
    textPrimary: "#FFFFFF",
    textSecondary: "#888888",
    inputBackground: "#1E1E1E",
    inputBorder: "#2A2A2A",
    chipDefault: "#1E1E1E",
    chipActive: "#FFFFFF",
    chipTextDefault: "#888888",
    chipTextActive: "#000000",
    iconColor: "#666666",
    profileBorder: "#333333",
    heartActive: "#E74C3C", // Red for heart
    heartBg: "rgba(231, 76, 60, 0.2)",
  },
  light: {
    background: "#F2F2F7",
    textPrimary: "#1C1C1E",
    textSecondary: "#636366",
    inputBackground: "#FFFFFF",
    inputBorder: "#D1D1D6",
    chipDefault: "#FFFFFF",
    chipActive: "#1C1C1E",
    chipTextDefault: "#636366",
    chipTextActive: "#FFFFFF",
    iconColor: "#8E8E93",
    profileBorder: "#D1D1D6",
    heartActive: "#E74C3C",
    heartBg: "rgba(231, 76, 60, 0.1)",
  },
};

// --- SUB-COMPONENTS ---
const CategoryChip = ({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: typeof ThemeColors.dark;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        S.chip,
        {
          backgroundColor: isActive ? colors.chipActive : colors.chipDefault,
          borderColor: isActive ? colors.chipActive : colors.profileBorder,
          shadowColor: "#000",
          shadowOpacity: isActive ? 0.2 : 0.05,
          shadowRadius: 5,
          elevation: 2,
        },
      ]}
    >
      <Text
        style={[
          S.chipText,
          { color: isActive ? colors.chipTextActive : colors.chipTextDefault },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? ThemeColors.dark : ThemeColors.light;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Bookmark Logic
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);

  // Load bookmarks whenever screen gains focus (returning from details)
  useFocusEffect(
    useCallback(() => {
      const loadBookmarks = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            setBookmarkedIds(JSON.parse(stored));
          }
        } catch (e) {
          console.error("Failed to load bookmarks", e);
        }
      };
      loadBookmarks();
    }, [])
  );

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return EVENTS.filter((e) => {
      // 1. Filter by Bookmark (if enabled)
      if (showBookmarked && !bookmarkedIds.includes(e.id)) {
        return false;
      }

      // 2. Filter by Category
      const matchesCategory =
        selectedCategory === "All" || e.category === selectedCategory;
      
      // 3. Filter by Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, showBookmarked, bookmarkedIds]);

  return (
    <SafeAreaView
      style={[S.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header Section */}
      <View style={[S.headerContainer, { backgroundColor: colors.background }]}>
        <View style={S.topRow}>
          <View>
            <Text style={[S.subtitle, { color: colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[S.title, { color: colors.textPrimary }]}>
              Discover Events
            </Text>
          </View>
          <Pressable
            style={[S.profileButton, { borderColor: colors.profileBorder }]}
          >
            <RNImage
              source={require("@/assets/images/logo.png")}
              style={S.avatar}
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View
          style={[
            S.searchBar,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.iconColor} />
          <TextInput
            style={[S.searchInput, { color: colors.textPrimary }]}
            placeholder="Search events, topics, or places..."
            placeholderTextColor={colors.iconColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.iconColor} />
            </Pressable>
          )}
        </View>

        {/* Categories + Heart Filter */}
        <View style={{ height: 50 }}>
          <FlatList style={{}}
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.categoryList}
            keyExtractor={(item) => item}
            // Add Heart Chip at the start
            ListHeaderComponent={
              <Pressable 
                onPress={() => setShowBookmarked(!showBookmarked)}
                style={[
                  S.iconChip,
                  {
                    backgroundColor: showBookmarked ? colors.heartBg : colors.chipDefault,
                    borderColor: showBookmarked ? colors.heartActive : colors.profileBorder,
                    height: 50,
                    width: 50,
                    borderRadius: 18
                  }
                ]}
              >
                <Ionicons 
                  name={showBookmarked ? "heart" : "heart-outline"} 
                  size={28} 
                  color={showBookmarked ? colors.heartActive : colors.iconColor} 
                />
              </Pressable>
            }
            renderItem={({ item }) => (
              <CategoryChip
                label={item}
                isActive={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
                colors={colors}
              />
            )}
          />
        </View>
      </View>

      {/* Events List */}
      <Animated.FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={S.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={S.cardWrapper}>
            <EventCard event={item} theme={item.theme} />
          </View>
        )}
        ListEmptyComponent={
          <View style={S.emptyState}>
            <Ionicons
              name={showBookmarked ? "heart-dislike-outline" : "calendar-outline"}
              size={50}
              color={colors.iconColor}
            />
            <Text style={[S.emptyText, { color: colors.textSecondary }]}>
              {showBookmarked ? "No saved events yet." : "No events found."}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {showBookmarked 
               ? "Go back and save some events you like!" 
               : "Try clearing your search or filters."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 2,
    borderRadius: 50,
    borderWidth: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    height: "100%",
  },
  categoryList: {
    paddingRight: 20,
    // gap: 10, // 'gap' works in newer RN versions, check if supported in your environment
  },
  // New Style for the Heart Icon Chip
  iconChip: {
    width: 40,
    height: 38, // Match height roughly with text chips
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Margin right because it's before the list items
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 25,
  },
  emptyState: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
});