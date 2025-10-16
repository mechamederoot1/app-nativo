import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image } from 'react-native';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { useLocalSearchParams } from 'expo-router';

export default function PhotoView() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <TopBar />
      <View style={styles.container}>
        <Text style={styles.sub}>Foto ID: {String(id ?? '')}</Text>
        <Image
          source={{ uri: 'https://picsum.photos/1000/800' }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <BottomNav active="feed" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: { marginBottom: 10, color: '#e5e7eb' },
  image: { width: '100%', height: '70%' },
});
