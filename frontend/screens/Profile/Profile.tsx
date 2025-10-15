import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import TopBar from '../../components/TopBar';
import {
  Heart,
  Home,
  MapPin,
  Briefcase,
  Users,
  ChevronRight,
  FileText,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { profileData } from './Data';
import { getPosts, subscribe, toggleLike } from '../../store/posts';

const palette = {
  screen: '#eff3ff',
  card: '#ffffff',
  subtleCard: '#f6f8ff',
  primary: '#2563eb',
  primaryAccent: '#7c3aed',
  primarySoft: '#dbeafe',
  border: '#d7e1ff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
};

export default function ProfileScreen() {
  const router = useRouter();
  const p = profileData;
  const [tab, setTab] = useState<'posts' | 'testimonials'>('posts');
  const [posts, setPosts] = useState(getPosts());

  useEffect(() => {
    const unsub = subscribe(() => setPosts(getPosts()));
    return unsub;
  }, []);

  const myPosts = useMemo(
    () => posts.filter((x) => x.user === 'Você'),
    [posts],
  );
  const postCount = myPosts.length;
  const connectionsCount = p.connectionsCount;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ImageBackground
            source={{ uri: p.cover }}
            style={styles.heroCover}
            imageStyle={styles.heroImage}
          >
            <LinearGradient
              colors={['rgba(15,23,42,0.05)', 'rgba(15,23,42,0.6)']}
              style={styles.heroOverlay}
            />
          </ImageBackground>

          <View style={styles.profileCard}>
            <View style={styles.avatarHolder}>
              <Image source={{ uri: p.avatar }} style={styles.avatarImage} />
            </View>

            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.username}>@{p.username}</Text>

            <View style={styles.metaRow}>
              <MapPin size={16} color={palette.textSecondary} />
              <Text style={styles.metaText}>{p.currentCity}</Text>
            </View>

            <Text numberOfLines={3} style={styles.tagline}>
              {p.bio}
            </Text>

            <View style={styles.statStrip}>
              <StatPill icon={FileText} label="Posts" value={postCount} />
              <StatPill icon={Users} label="Conexões" value={connectionsCount} />
              <Pressable
                onPress={() => router.push('/profile/about')}
                style={styles.aboutButton}
              >
                <Text style={styles.aboutButtonText}>Sobre</Text>
                <ChevronRight size={16} color="#ffffff" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightStrip}
          >
            {p.highlights.map((h, i) => (
              <View key={`${h}-${i}`} style={styles.highlightItem}>
                <LinearGradient
                  colors={[palette.primary, palette.primaryAccent]}
                  style={styles.highlightRing}
                >
                  <View style={styles.highlightInner}>
                    <Image source={{ uri: h }} style={styles.highlightImage} />
                  </View>
                </LinearGradient>
                <Text style={styles.highlightLabel}>Destaque {i + 1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações pessoais</Text>
            <InfoRow icon={Heart} value={p.relationshipStatus} />
            <InfoRow icon={Briefcase} value={p.workplace} divider />
            <InfoRow icon={MapPin} value={p.currentCity} divider />
            <InfoRow icon={Home} value={p.hometown} divider />
            <InfoRow icon={Users} value={`${p.connectionsCount} conexões`} divider />
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>Amigos</Text>
              <Text style={styles.cardHeaderMeta}>Conexões recentes</Text>
            </View>
            <View style={styles.friendsGrid}>
              {p.recentFriends.map((f) => (
                <View key={f.id} style={styles.friendItem}>
                  <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                  <Text numberOfLines={1} style={styles.friendName}>
                    {f.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <Segmented tab={tab} setTab={setTab} />
        </View>

        <View style={styles.postsWrapper}>
          {tab === 'posts' ? (
            myPosts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Nenhum post ainda.</Text>
              </View>
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
                  <Text style={styles.testimonialMeta}>
                    — {t.author} · {t.date}
                  </Text>
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

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconCircle}>
        <Icon size={16} color={palette.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Segmented({
  tab,
  setTab,
}: {
  tab: 'posts' | 'testimonials';
  setTab: (t: 'posts' | 'testimonials') => void;
}) {
  return (
    <View style={styles.segmentTrack}>
      <Pressable
        onPress={() => setTab('posts')}
        style={[styles.segmentButton, tab === 'posts' && styles.segmentButtonActive]}
      >
        <Text
          style={[
            styles.segmentLabel,
            tab === 'posts' && styles.segmentLabelActive,
          ]}
        >
          Posts
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setTab('testimonials')}
        style={[styles.segmentButton, tab === 'testimonials' && styles.segmentButtonActive]}
      >
        <Heart
          size={14}
          color={tab === 'testimonials' ? palette.primary : palette.textMuted}
        />
        <Text
          style={[
            styles.segmentLabel,
            styles.segmentLabelWithIcon,
            tab === 'testimonials' && styles.segmentLabelActive,
          ]}
        >
          Depoimentos
        </Text>
      </Pressable>
    </View>
  );
}

function InfoRow({
  icon: Icon,
  value,
  divider,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  value: string;
  divider?: boolean;
}) {
  return (
    <View style={[styles.infoRow, divider && styles.infoRowDivider]}>
      <View style={styles.infoIconWrap}>
        <Icon size={16} color={palette.primary} />
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  scrollView: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    paddingBottom: 120,
  },
  heroCover: {
    height: 240,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
  },
  profileCard: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: -90,
    paddingTop: 76,
    paddingBottom: 26,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#1e293b',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
    alignItems: 'center',
  },
  avatarHolder: {
    position: 'absolute',
    top: -56,
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: palette.card,
    backgroundColor: palette.card,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  username: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metaText: {
    marginLeft: 6,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  tagline: {
    marginTop: 16,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  statStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: -6,
    width: '100%',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.subtleCard,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  aboutButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  aboutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  highlightStrip: {
    paddingVertical: 16,
    paddingRight: 16,
  },
  highlightItem: {
    marginRight: 18,
    alignItems: 'center',
  },
  highlightRing: {
    padding: 3,
    borderRadius: 48,
  },
  highlightInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightLabel: {
    marginTop: 8,
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 24,
    shadowColor: '#1e293b',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  infoTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoValue: {
    color: palette.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 24,
    shadowColor: '#1e293b',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardHeaderMeta: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: -8,
  },
  friendItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  friendAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: palette.subtleCard,
  },
  friendName: {
    color: palette.textPrimary,
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentWrap: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#e5ecff',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  segmentButtonActive: {
    backgroundColor: palette.card,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  segmentLabel: {
    color: palette.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  segmentLabelWithIcon: {
    marginLeft: 6,
  },
  segmentLabelActive: {
    color: palette.primary,
  },
  postsWrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
    paddingBottom: 48,
  },
  emptyBox: {
    backgroundColor: palette.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  testimonialCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1e293b',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  testimonialQuote: {
    color: palette.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  testimonialMeta: {
    marginTop: 10,
    color: palette.textSecondary,
    fontSize: 13,
  },
});
