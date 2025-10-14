import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnread } from '../contexts/UnreadContext';

export default function TopBar() {
  const router = useRouter();
  const { unreadVisits } = useUnread();
  const insets = useSafeAreaInsets();

  const paddingTop = Math.max(
    insets.top + 2,
    Platform.OS === 'android' ? 12 : 14,
  );

  const messages = useMemo(
    () => [
      { text: 'Paulo acabou de entrar', avatar: 'https://i.pravatar.cc/100?img=15' },
      { text: 'Paulo te enviou uma mensagem', avatar: 'https://i.pravatar.cc/100?img=15' },
    ],
    [],
  );
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((p) => (p + 1) % messages.length);
      setVisible(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: -8, useNativeDriver: true }),
          ]).start(() => setVisible(false));
        }, 2200);
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [messages.length, opacity, translateY]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop, paddingBottom: Platform.OS === 'ios' ? 8 : 6 },
      ]}
    >
      <TouchableOpacity onPress={() => router.push('/feed')}>
        <Text style={styles.logo}>Vibe</Text>
      </TouchableOpacity>

      <View style={styles.centerToastArea}>
        {visible ? (
          <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
            <Image source={{ uri: messages[idx].avatar }} style={styles.toastAvatar} />
            <Text style={styles.toastText}>{messages[idx].text}</Text>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={styles.iconBtn}
        >
          <Search size={16} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          style={styles.iconBtn}
        >
          <Bell size={16} color="#6b7280" />
          {unreadVisits > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadVisits}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.avatarPlaceholder}
        >
          <Text style={{ color: '#0856d6' }}>U</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  logo: { fontSize: 18, fontWeight: '800', color: '#0856d6' },
  centerToastArea: { flex: 1, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toastAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  toastText: { color: '#fff', fontSize: 12 },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12 },
  avatarPlaceholder: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
