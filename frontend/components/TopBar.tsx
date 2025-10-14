import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { useUnread } from '../contexts/UnreadContext';

export default function TopBar() {
  const router = useRouter();
  const { unreadNotifications, unreadVisits } = useUnread();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/feed')}>
        <Text style={styles.logo}>Vibe</Text>
      </TouchableOpacity>

      <View style={styles.rightRow}>
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconBtn}>
          <Search size={18} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
          <Bell size={18} color="#6b7280" />
          {unreadVisits > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{unreadVisits}</Text></View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarPlaceholder}>
          <Text style={{color:'#0856d6'}}>U</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { fontSize: 22, fontWeight: '800', color: '#0856d6' },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12 },
  avatarPlaceholder: { marginLeft: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: '#e6f0ff', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -6, top: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
