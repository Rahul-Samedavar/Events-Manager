import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Image } from 'expo-image';

export type Event = {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  department: string;
  image: string;         
  description: string;
};

export const defaultEvent: Event = {
    id: "default",
    title: 'Keynote: The Future of AI',
    time: '10:30 AM – 11:30 AM',
    date: "03-02-2025",
    location: 'SDJ Auditorium',
    department: 'Cultural',    
    image: require('@/assets/event-placeholder.png'),
    description:
      'Join us for an inspiring talk on the evolving landscape of artificial intelligence and its impact on everyday life.',
  };

type Props = {
  event: Event;
  styleType?: 'glossyGold' | 'classic' | 'minimal';
};

export default function EventCard({ event, styleType = 'classic' }: Props) {
  const scheme = useColorScheme();
  if (!event) event = defaultEvent;

  const isDark = scheme === 'dark';

  const colors = {
    bg: isDark ? '#1A1A1A' : '#BF9B30',
    border: isDark ? '#DBC15A' : '#bc8e0497',
    title: isDark ? '#DBC15A' : '#FDFBD4',
    label: isDark ? '#DBC15A' : '#FDFBD4',
    dept: isDark ? '#DBC15A' : '#FDFBD4',
    desc: isDark ? '#ffffff' : '#ffffff',
  };

  const S = StyleSheet.create({
    card: {
      maxWidth: 450,
      maxHeight: 450,
      backgroundColor: colors.bg,
      borderRadius: 18,
      padding: 20,
      paddingBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    image: {
      height: 160,
      borderRadius: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.title,
      marginBottom: 4,
      textShadowColor: colors.bg,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    label: { fontSize: 13, color: colors.label, fontWeight: 600 },
    dept: { fontSize: 16, color: colors.dept, marginTop: 4, fontWeight: 600, textAlign: 'right' },
    desc: { marginTop: 8, color: colors.desc, lineHeight: 22, textAlign: 'justify', marginBottom: 8 },
    leak: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.22)',
      borderRadius: 18,
    },
  });

  return (
    <Link href={`/eventPages/${event.id}`} style={{display: "contents"}} asChild> 
      {/* asChild lets Pressable become the clickable area */}
      <Pressable style={{ width: "100%" }}>
        <View style={S.card}>
          <View style={S.leak} />

          <Image source={event.image} style={S.image} />

          <Text style={S.title}>{event.title}</Text>
          <Text style={S.dept}>{event.department}</Text>
          <Text style={S.desc}>{event.description}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={S.label}>{event.date}  {event.time}</Text>
            <Text style={S.label}>{event.location}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
