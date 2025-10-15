import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image } from 'react-native';
import TopBar from '../../frontend/components/TopBar';
import BottomNav from '../../frontend/components/BottomNav';
import { useLocalSearchParams } from 'expo-router';

export default function CoverView() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar />
      <View style={styles.container}>
        <Text style={styles.title}>Capa</Text>
        <Text style={styles.sub}>ID: {String(id ?? '')}</Text>
        <Image source={{ uri: 'https://picsum.photos/1200/400' }} style={styles.image} />
      </View>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { marginTop: 6, color: '#64748b' },
  image: { width: '100%', height: 200, borderRadius: 10, marginTop: 12 },
});
