import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from 'react-native';
import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';
import { useUnread } from '../frontend/contexts/UnreadContext';

const MOCK_VISITS = [
  { id: 'v1', name: 'Marina', time: 'agora', avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 'v2', name: 'Ricardo', time: '3h', avatar: 'https://i.pravatar.cc/100?img=22' },
  { id: 'v3', name: 'Sara', time: 'ontem', avatar: 'https://i.pravatar.cc/100?img=33' },
];

export default function VisitsScreen() {
  const { markVisitsRead } = useUnread();
  useEffect(() => {
    markVisitsRead();
  }, [markVisitsRead]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <TopBar />
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.title}>Visitas recentes</Text>
        <FlatList
          data={MOCK_VISITS}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
      <BottomNav active="visits" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  time: { color: '#6b7280', marginTop: 2 },
});
