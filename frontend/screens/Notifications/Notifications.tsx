import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Bell, Calendar, Heart, Users } from 'lucide-react-native';

import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { useUnread } from '../../contexts/UnreadContext';

type NotificationType = 'visit' | 'match' | 'event';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Nova visita',
    description: 'Marina visitou o seu perfil há poucos instantes.',
    time: 'Agora mesmo',
    type: 'visit',
    read: false,
  },
  {
    id: 'n2',
    title: 'Solicitação aceita',
    description: 'Bruno aceitou o seu pedido de conexão.',
    time: '2h',
    type: 'match',
    read: false,
  },
  {
    id: 'n3',
    title: 'Novo evento sugerido',
    description: 'UX Talks Recife começa amanhã às 19h.',
    time: 'ontem',
    type: 'event',
    read: true,
  },
];

type NotificationVisual = {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  background: string;
};

const ICON_META: Record<NotificationType, NotificationVisual> = {
  visit: { Icon: Users, color: '#0856d6', background: '#eff6ff' },
  match: { Icon: Heart, color: '#d946ef', background: '#fdf4ff' },
  event: { Icon: Calendar, color: '#22c55e', background: '#f0fdf4' },
};

function NotificationCard({
  item,
  onToggleRead,
}: {
  item: NotificationItem;
  onToggleRead: (id: string) => void;
}) {
  const { Icon, color, background } = ICON_META[item.type];

  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onToggleRead(item.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrapper, { backgroundColor: background }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Bell size={16} color={item.read ? '#cbd5f5' : '#64748b'} />
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const {
    markNotificationsRead,
    setUnreadNotifications,
  } = useUnread();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    setUnreadNotifications(unreadCount);
  }, [setUnreadNotifications, unreadCount]);

  useEffect(() => {
    if (unreadCount === 0) {
      markNotificationsRead();
    }
  }, [markNotificationsRead, unreadCount]);

  const handleToggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification,
      ),
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    markNotificationsRead();
  }, [markNotificationsRead]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Notificações</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} ${unreadCount === 1 ? 'mensagem pendente' : 'mensagens pendentes'}`
                : 'Tudo em dia por aqui!'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Marcar tudo como lido</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard item={item} onToggleRead={handleToggleRead} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
  },
  markAllText: {
    color: '#0369a1',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  cardUnread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f8fbff',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    color: '#64748b',
  },
});
