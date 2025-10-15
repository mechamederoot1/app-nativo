import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import TopBar from '../../components/TopBar';
import { Heart, Home, MapPin, Briefcase, Users, ChevronRight, FileText } from 'lucide-react-native';
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
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER - light, original style (unique) with soft fade and centered avatar */}
        <View style={styles.headerWrap}>
          <ImageBackground source={{ uri: p.cover }} style={styles.headerCover} imageStyle={{ resizeMode: 'cover' }}>
            <LinearGradient
              colors={["rgba(241,245,249,0)", "rgba(241,245,249,0.85)", "rgba(241,245,249,1)"]}
              style={styles.headerOverlay}
            />
          </ImageBackground>

          {/* Centered avatar (requirement) */}
          <View style={styles.avatarCenterWrap}>
            <View style={styles.avatarShadow}>
              <Image source={{ uri: p.avatar }} style={styles.avatar} />
            </View>
          </View>

          <View style={styles.headerNames}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.username}>@{p.username}</Text>
            <Text numberOfLines={2} style={styles.tagline}>{p.bio}</Text>
          </View>

          <View style={styles.headerStatsRow}>
            <StatPill icon={FileText} label="Posts" value={postCount} />
            <StatPill icon={Users} label="Conexões" value={connectionsCount} />
            <Pressable onPress={() => router.push('/profile/about')} style={styles.aboutPill}>
              <Text style={styles.aboutPillText}>Sobre</Text>
              <ChevronRight size={14} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* HIGHLIGHTS */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
            {p.highlights.map((h, i) => (
              <View key={`${h}-${i}`} style={styles.highlightCard}>
                <Image source={{ uri: h }} style={styles.highlightImg} />
                <LinearGradient colors={["rgba(255,255,255,0)", "rgba(0,0,0,0.25)"]} style={styles.highlightOverlay} />
                <Text style={styles.highlightCaption}>• Destaque {i + 1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* PERSONAL INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações pessoais</Text>
          <InfoRow icon={Home} label="Cidade natal" value={p.hometown} />
          <InfoRow icon={MapPin} label="Cidade atual" value={p.currentCity} />
          <InfoRow icon={Heart} label="Relacionamento" value={p.relationshipStatus} />
          <InfoRow icon={Briefcase} label="Trabalho" value={p.workplace} />
          <InfoRow icon={Users} label="Conexões" value={`${p.connectionsCount}`} />
        </View>

        {/* FRIENDS PREVIEW GRID */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Amigos</Text>
          <View style={styles.friendsGrid}>
            {p.recentFriends.map((f) => (
              <View key={f.id} style={styles.friendItem}>
                <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                <Text numberOfLines={1} style={styles.friendName}>{f.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SEGMENTED CONTROL */}
        <View style={styles.segmentWrap}>
          <Segmented tab={tab} setTab={setTab} />
        </View>

        {/* CONTENT */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          {tab === 'posts' ? (
            myPosts.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyText}>Nenhum post ainda.</Text></View>
            ) : (
              myPosts.map((pp) => (
                <PostCard key={pp.id} post={pp} onLike={() => toggleLike(pp.id)} />
              ))
            )
          ) : (
            <View>
              {p.testimonials.map((t) => (
                <View key={t.id} style={styles.testimonialCard}>
                  <Text style={styles.testimonialQuote}>“{t.text}”</Text>
                  <Text style={styles.testimonialMeta}>— {t.author} · {t.date}</Text>
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

function StatPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <View style={styles.pillRow}>
        <View style={styles.pillIconWrap}>
          <Icon size={14} color="#64748b" />
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Segmented({ tab, setTab }: { tab: 'posts' | 'testimonials'; setTab: (t: 'posts' | 'testimonials') => void }) {
  return (
    <View style={styles.segment}>
      <Pressable onPress={() => setTab('posts')} style={[styles.segmentBtn, tab === 'posts' && styles.segmentActive]}>
        <Text style={[styles.segmentText, tab === 'posts' && styles.segmentTextActive]}>Posts</Text>
      </Pressable>
      <Pressable onPress={() => setTab('testimonials')} style={[styles.segmentBtn, tab === 'testimonials' && styles.segmentActive]}>
        <Heart size={14} color={tab === 'testimonials' ? '#0856d6' : '#9aa4b2'} />
        <Text style={[styles.segmentText, { marginLeft: 6 }, tab === 'testimonials' && styles.segmentTextActive]}>Depoimentos</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.infoIconWrap}>
          <Icon size={14} color="#64748b" />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: { position: 'relative', paddingBottom: 70, backgroundColor: '#f1f5f9' },
  headerCover: { width: '100%', height: 160 },
  headerOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  avatarCenterWrap: { position: 'absolute', left: 0, right: 0, top: 110, alignItems: 'center' },
  avatarShadow: { width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: '#ffffff', backgroundColor: '#ffffff', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  avatar: { width: '100%', height: '100%' },
  headerNames: { alignItems: 'center', marginTop: 64 },
  name: { color: '#111827', fontSize: 22, fontWeight: '800' },
  username: { color: '#6b7280', marginTop: 2 },
  tagline: { color: '#64748b', marginTop: 8, paddingHorizontal: 24, textAlign: 'center' },
  headerStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 as unknown as number, marginTop: 14, paddingHorizontal: 16 },
  statPill: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center' },
  pillRow: { flexDirection: 'row', alignItems: 'center' },
  pillIconWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#eef2f7', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  statValue: { color: '#0f172a', fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 12, marginTop: 2 },
  aboutPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  aboutPillText: { color: '#0f172a', fontWeight: '700', marginRight: 6 },

  sectionWrap: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  highlightCard: { width: 110, height: 150, borderRadius: 14, overflow: 'hidden', marginRight: 12, backgroundColor: '#e5e7eb' },
  highlightImg: { width: '100%', height: '100%' },
  highlightOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
  highlightCaption: { position: 'absolute', bottom: 8, left: 10, right: 10, color: '#f8fafc', fontWeight: '700', fontSize: 12 },

  infoCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 14 },
  infoTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoIconWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#eef2f7', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  infoLabel: { color: '#64748b' },
  infoValue: { color: '#0f172a', fontWeight: '600' },

  friendsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  friendItem: { width: '25%', alignItems: 'center', marginBottom: 12 },
  friendAvatar: { width: 64, height: 64, borderRadius: 32 },
  friendName: { color: '#0f172a', marginTop: 6, fontSize: 12, paddingHorizontal: 4, textAlign: 'center' },

  segmentWrap: { paddingHorizontal: 16, marginTop: 14 },
  segment: { flexDirection: 'row', backgroundColor: '#eef2f7', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, padding: 4 },
  segmentBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  segmentActive: { backgroundColor: '#dbeafe' },
  segmentText: { color: '#6b7280', fontWeight: '700' },
  segmentTextActive: { color: '#0856d6' },

  emptyBox: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', padding: 20, borderRadius: 12 },
  emptyText: { color: '#6b7280' },

  testimonialCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', padding: 16, borderRadius: 12, marginBottom: 10 },
  testimonialQuote: { color: '#0f172a' },
  testimonialMeta: { marginTop: 6, color: '#6b7280' },
});
