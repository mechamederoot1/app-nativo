import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import TopBar from '../../components/TopBar';
import { Heart, Home, MapPin, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { profileData } from './Data';
import { getPosts, subscribe, toggleLike } from '../../store/posts';

export default function ProfileScreen() {
  const router = useRouter();
  const p = profileData;
  const [tab, setTab] = useState<'posts' | 'testimonials'>('posts');
  const [posts, setPosts] = useState(getPosts());

  useEffect(() => {
    const unsub = subscribe(() => setPosts(getPosts()));
    return unsub;
  }, []);

  const myPosts = useMemo(() => posts.filter((x) => x.user === 'Você'), [posts]);
  const postCount = myPosts.length;
  const connectionsCount = p.connectionsCount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover and avatar */}
        <View style={styles.coverWrap}>
          <Image source={{ uri: p.cover }} style={styles.cover} />
        </View>

        <View style={styles.metaWrap}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: p.avatar }} style={styles.avatar} />
          </View>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.handle}>@{p.username}</Text>
            <Text style={styles.headerTagline} numberOfLines={1}>{p.bio}</Text>
          </View>
        </View>

        {/* Counters and About */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Biografia</Text>
          <Text style={styles.bio}>{p.bio}</Text>

          <View style={styles.rowStats}>
            <View style={styles.stat}><Text style={styles.statNumber}>{postCount}</Text><Text style={styles.statLabel}>Posts</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{connectionsCount}</Text><Text style={styles.statLabel}>Conexões</Text></View>
            <Pressable onPress={() => router.push('/profile/about')} style={styles.aboutBtn}>
              <Text style={styles.aboutText}>Sobre</Text>
            </Pressable>
          </View>
        </View>

        {/* Highlights */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
            {p.highlights.map((h, i) => (
              <View key={`${h}-${i}`} style={styles.highlightItem}>
                <Image source={{ uri: h }} style={styles.highlight} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Informações pessoais */}
        <View style={styles.quickInfoCard}>
          <Text style={styles.sectionTitle}>Informações pessoais</Text>
          <InfoRow icon={Home} label="Cidade natal" value={p.hometown} />
          <InfoRow icon={MapPin} label="Cidade atual" value={p.currentCity} />
          <InfoRow icon={Heart} label="Relacionamento" value={p.relationshipStatus} />
          <InfoRow icon={Briefcase} label="Trabalho" value={p.workplace} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'posts' && styles.tabActive]} onPress={() => setTab('posts')}>
            <Text style={[styles.tabText, tab === 'posts' && styles.tabTextActive]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'testimonials' && styles.tabActive]} onPress={() => setTab('testimonials')}>
            <Heart size={16} color={tab === 'testimonials' ? '#0856d6' : '#6b7280'} />
            <Text style={[styles.tabText, { marginLeft: 6 }, tab === 'testimonials' && styles.tabTextActive]}>Depoimentos</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {tab === 'posts' ? (
            myPosts.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyText}>Nenhum post ainda.</Text></View>
            ) : (
              myPosts.map((p) => (
                <PostCard key={p.id} post={p} onLike={() => toggleLike(p.id)} />
              ))
            )
          ) : (
            <View>
              {profileData.testimonials.map((t) => (
                <View key={t.id} style={styles.testimonialCard}>
                  <Text style={styles.testimonialText}>“{t.text}”</Text>
                  <Text style={styles.testimonialAuthor}>— {t.author} · {t.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#e9eef8', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <Icon size={14} color="#64748b" />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coverWrap: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  cover: { width: '100%', height: 140 },
  metaWrap: { alignItems: 'center', marginTop: -40 },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', borderWidth: 4, borderColor: '#fff', backgroundColor: '#fff' },
  avatar: { width: 96, height: 96 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  handle: { color: '#6b7280' },
  headerTagline: { color: '#94a3b8', marginTop: 4, maxWidth: '90%', textAlign: 'center' },
  infoCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5edf6', marginTop: 12, padding: 16, paddingBottom: 16, borderRadius: 12, marginHorizontal: 16 },
  bio: { color: '#374151', lineHeight: 20 },
  rowStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  stat: { alignItems: 'center', flex: 1 },
  statNumber: { fontWeight: '700', fontSize: 16 },
  statLabel: { color: '#6b7280' },
  aboutBtn: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#e2e8f0', borderRadius: 999 },
  aboutText: { color: '#0f172a', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  highlightItem: { marginRight: 10 },
  highlight: { width: 64, height: 64, borderRadius: 32 },
  quickInfoCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5edf6', marginHorizontal: 16, marginTop: 10, padding: 16, borderRadius: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#6b7280' },
  infoValue: { color: '#111827', fontWeight: '600' },
  tabsRow: { flexDirection: 'row', marginTop: 14, paddingHorizontal: 16 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f3f4f6', borderRadius: 999, marginRight: 10 },
  tabActive: { backgroundColor: '#e6f0ff' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#0856d6' },
  emptyBox: { backgroundColor: '#fff', padding: 20, borderRadius: 8 },
  emptyText: { color: '#6b7280' },
  testimonialCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10 },
  testimonialText: { color: '#111827' },
  testimonialAuthor: { marginTop: 6, color: '#6b7280' },
});
