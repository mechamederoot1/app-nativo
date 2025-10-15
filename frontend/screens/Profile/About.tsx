import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { profileData } from './Data';

export default function AboutScreen() {
  const p = profileData;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Image source={{ uri: p.cover }} style={styles.cover} />
        <View style={styles.headerRow}>
          <Image source={{ uri: p.avatar }} style={styles.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.handle}>@{p.username}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre mim</Text>
          <Text style={styles.text}>{p.bio}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>
          <InfoRow label="Cidade natal" value={p.hometown} />
          <InfoRow label="Cidade atual" value={p.currentCity} />
          <InfoRow label="Relacionamento" value={p.relationshipStatus} />
          <InfoRow label="Trabalho" value={p.workplace} />
          <InfoRow label="Conexões" value={`${p.connectionsCount}`} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cargos e Empregos</Text>
          {p.positions.map((pos, i) => (
            <View key={`${pos.company}-${i}`} style={styles.rowBetween}>
              <View>
                <Text style={styles.itemTitle}>{pos.title}</Text>
                <Text style={styles.itemSub}>{pos.company}</Text>
              </View>
              <Text style={styles.itemTime}>{pos.start} — {pos.end || 'Presente'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Formações</Text>
          {p.education.map((e, i) => (
            <View key={`${e.institution}-${i}`} style={styles.rowBetween}>
              <View>
                <Text style={styles.itemTitle}>{e.degree}</Text>
                <Text style={styles.itemSub}>{e.institution}</Text>
              </View>
              <Text style={styles.itemTime}>{e.start} — {e.end || 'Presente'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Grupos</Text>
          {p.groups.map((g) => (
            <View key={g.id} style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{g.name}</Text>
              <Text style={styles.itemSub}>{g.members} membros</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Amizades recentes</Text>
          <View style={styles.friendsRow}>
            {p.recentFriends.map((f) => (
              <View key={f.id} style={styles.friendItem}>
                <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{f.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 140 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: -32 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  handle: { color: '#6b7280', marginTop: 2 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, color: '#111827' },
  text: { color: '#374151', lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { color: '#6b7280' },
  infoValue: { color: '#111827', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  itemTitle: { color: '#111827', fontWeight: '700' },
  itemSub: { color: '#6b7280' },
  itemTime: { color: '#6b7280' },
  friendsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  friendItem: { width: '33.33%', alignItems: 'center', marginBottom: 12 },
  friendAvatar: { width: 64, height: 64, borderRadius: 32 },
  friendName: { marginTop: 6, color: '#111827', fontSize: 12, textAlign: 'center' },
});
