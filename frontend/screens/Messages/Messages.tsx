import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  MessageCircle,
  CheckCheck
} from 'lucide-react-native';
import BottomNav from '../../components/BottomNav';
import TopBar from '../../components/TopBar';
import { api } from '../../utils/api';
import { initializeSocket, getSocket } from '../../utils/websocket';

const getDimensions = () => {
  if (Platform.OS === 'web') {
    return { width: typeof window !== 'undefined' ? window.innerWidth : 375 };
  }
  return Dimensions.get('window');
};
const { width } = getDimensions();

interface ChatItem {
  id: number;
  name?: string;
  participants: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_photo?: string;
  }>;
  latest_message?: {
    id: number;
    content: string;
    created_at: string;
    sender: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  unread_count: number;
  is_group: boolean;
}

const ChatItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chatItem,
      item.unread && styles.chatItemUnread
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.avatarContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      {item.online && <View style={styles.onlineBadge} />}
    </View>

    <View style={styles.chatContent}>
      <View style={styles.chatHeader}>
        <Text style={[
          styles.chatName,
          item.unread && styles.chatNameUnread
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.chatTime,
          item.unread && styles.chatTimeUnread
        ]}>
          {item.time}
        </Text>
      </View>

      <View style={styles.chatFooter}>
        <Text
          style={[
            styles.chatMessage,
            item.unread && styles.chatMessageUnread
          ]}
          numberOfLines={2}
        >
          {item.message}
        </Text>

        {item.unread ? (
          item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>Novo</Text>
            </View>
          )
        ) : (
          <CheckCheck size={16} color="#94a3b8" strokeWidth={2} />
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function MessagesScreen() {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const filteredChats = useMemo(() => {
    if (!query.trim()) return MOCK;
    return MOCK.filter(chat =>
      chat.name.toLowerCase().includes(query.toLowerCase()) ||
      chat.message.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bate-papo</Text>
            <Text style={styles.subtitle}>3 mensagens não lidas</Text>
          </View>

          <TouchableOpacity style={styles.newChatBtn} activeOpacity={0.7}>
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" strokeWidth={2} />
          <TextInput
            placeholder="Buscar conversas..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatItem item={item} onPress={() => { }} />}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Nenhuma conversa encontrada</Text>
              <Text style={styles.emptyText}>
                Tente buscar por outro nome ou mensagem
              </Text>
            </View>
          }
        />
      </View>

      <BottomNav active="messages" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  newChatBtn: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  chatList: {
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chatItemUnread: {
    backgroundColor: '#f8fafc',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1f5f9',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  chatNameUnread: {
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 13,
    color: '#94a3b8',
  },
  chatTimeUnread: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  chatMessageUnread: {
    color: '#334155',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
