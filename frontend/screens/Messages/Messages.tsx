import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import MessageItem from '../../components/MessageItem';
import BottomNav from '../../components/BottomNav';
import TopBar from '../../components/TopBar';

const MOCK = [
  { id: '1', name: 'Jaque Santos', avatar: 'https://i.pravatar.cc/150?img=10', snippet: 'Oi', time: '18:16', unread: false },
  { id: '2', name: 'Bruno Almeida', avatar: 'https://i.pravatar.cc/150?img=12', snippet: 'Vamos marcar?', time: '12:02', unread: true },
  { id: '3', name: 'Carla', avatar: 'https://i.pravatar.cc/150?img=5', snippet: 'Adorei a foto!', time: 'ontem', unread: false },
];

export default function MessagesScreen() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    let data = MOCK;
    if (filter === 'unread') data = data.filter(d => d.unread);
    if (query.trim()) data = data.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.snippet.toLowerCase().includes(query.toLowerCase()));
    return data;
  }, [filter, query]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar />

      <View style={styles.container}>
        <Text style={styles.title}>Mensagens</Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setFilter('all')} style={[styles.tab, filter === 'all' && styles.tabActive]}>
            <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('unread')} style={[styles.tab, filter === 'unread' && styles.tabActive]}>
            <Text style={[styles.tabText, filter === 'unread' && styles.tabTextActive]}>Não lidas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <TextInput placeholder="Buscar conversas..." value={query} onChangeText={setQuery} style={styles.searchInput} />
        </View>

        <FlatList data={list} keyExtractor={i => i.id} renderItem={({ item }) => <MessageItem item={item} />} />
      </View>

      <BottomNav active="messages" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  logo: { fontSize: 24, fontWeight: '800', color: '#0856d6' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12 },
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f3f4f6', marginRight: 8 },
  tabActive: { backgroundColor: '#0856d6' },
  tabText: { color: '#374151' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  searchWrap: { marginBottom: 12 },
  searchInput: { borderWidth: 1, borderColor: '#e6e6e9', borderRadius: 8, padding: 12 },
});
