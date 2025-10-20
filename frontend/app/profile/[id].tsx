import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Mail,
  UserPlus,
  Heart,
  MessageCircle,
} from 'lucide-react-native';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 200;

type UserProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string | null;
  cover_photo?: string | null;
  created_at: string;
};

type Post = {
  id: string;
  userId: number;
  user: string;
  avatar?: string;
  cover?: string;
  content: string;
  time: string;
  image?: string;
  likes?: number;
  liked?: boolean;
  comments: any[];
};

export default function UserProfileView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const userId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<'posts' | 'about'>('posts');
  const [isFriend, setIsFriend] = useState(false);
  const [ratings, setRatings] = useState({
    confiavel: 142,
    legal: 87,
    sexy: 56,
  });
  const [userVotes, setUserVotes] = useState({
    confiavel: false,
    legal: false,
    sexy: false,
  });

  const getAbsoluteUrl = (relativeUrl?: string | null): string | undefined => {
    if (!relativeUrl) return undefined;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const BASE_URL =
      (typeof process !== 'undefined' &&
        (process as any).env &&
        (process as any).env.EXPO_PUBLIC_API_URL) ||
      'http://localhost:5050';
    return `${BASE_URL}${relativeUrl}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const api = await import('../../utils/api');

        const userResponse = await api.getUserById(userId);
        if (!mounted) return;

        setUser(userResponse);

        const postsResponse = await api.getUserPosts(userId);
        if (!mounted) return;

        const mappedPosts = postsResponse.map((p: any) => ({
          id: String(p.id),
          userId: p.user_id,
          user: p.user_name,
          avatar: getAbsoluteUrl(p.user_profile_photo),
          cover: getAbsoluteUrl(p.user_cover_photo),
          content: p.content,
          time: new Date(p.created_at).toLocaleTimeString(),
          image: getAbsoluteUrl(p.media_url),
          likes: 0,
          liked: false,
          comments: [],
        }));
        setPosts(mappedPosts);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Falha ao carregar perfil');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleRating = (type: 'confiavel' | 'legal' | 'sexy') => {
    if (userVotes[type]) return;
    setRatings((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    setUserVotes((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#0f172a" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#0f172a" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Perfil não encontrado</Text>
          <Text style={styles.errorSubtitle}>{error || `ID: ${userId}`}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profilePhotoUrl = getAbsoluteUrl(user.profile_photo);
  const coverPhotoUrl = getAbsoluteUrl(user.cover_photo);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#0f172a" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo */}
        <View style={styles.coverSection}>
          {coverPhotoUrl && (
            <Image
              source={{ uri: coverPhotoUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profilePhotoUrl && (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.profilePhoto}
                />
              )}
              {!profilePhotoUrl && (
                <View style={styles.profilePhotoPlaceholder}>
                  <Text style={styles.profilePhotoText}>
                    {user.first_name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileNameContainer}>
              <Text style={styles.profileName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => alert('Enviar mensagem para ' + user.first_name)}
            >
              <Mail size={18} color="#ffffff" strokeWidth={2} />
              <Text style={styles.actionButtonTextPrimary}>Mensagem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setIsFriend(!isFriend)}
            >
              <UserPlus
                size={18}
                color={isFriend ? '#0ea5e9' : '#64748b'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  isFriend && { color: '#0ea5e9' },
                ]}
              >
                {isFriend ? 'Amigo' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ratings Section */}
          <View style={styles.ratingsSection}>
            <Text style={styles.ratingsSectionTitle}>Avaliações sociais</Text>
            <View style={styles.ratingButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  userVotes.confiavel && styles.ratingButtonActive,
                ]}
                onPress={() => handleRating('confiavel')}
                disabled={userVotes.confiavel}
              >
                <Text style={styles.ratingEmoji}>👍</Text>
                <Text style={styles.ratingLabel}>Confiável</Text>
                <Text style={styles.ratingCount}>{ratings.confiavel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  userVotes.legal && styles.ratingButtonActive,
                ]}
                onPress={() => handleRating('legal')}
                disabled={userVotes.legal}
              >
                <Text style={styles.ratingEmoji}>😎</Text>
                <Text style={styles.ratingLabel}>Legal</Text>
                <Text style={styles.ratingCount}>{ratings.legal}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  userVotes.sexy && styles.ratingButtonActive,
                ]}
                onPress={() => handleRating('sexy')}
                disabled={userVotes.sexy}
              >
                <Text style={styles.ratingEmoji}>🔥</Text>
                <Text style={styles.ratingLabel}>Sexy</Text>
                <Text style={styles.ratingCount}>{ratings.sexy}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'posts' && styles.tabActive]}
            onPress={() => setTab('posts')}
          >
            <MessageCircle
              size={18}
              color={tab === 'posts' ? '#0ea5e9' : '#64748b'}
              strokeWidth={2}
            />
            <Text
              style={[styles.tabText, tab === 'posts' && styles.tabTextActive]}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'about' && styles.tabActive]}
            onPress={() => setTab('about')}
          >
            <Text style={styles.tabIcon}>ℹ️</Text>
            <Text
              style={[styles.tabText, tab === 'about' && styles.tabTextActive]}
            >
              Sobre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {tab === 'posts' && (
          <View style={styles.postsContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhuma publicação</Text>
              </View>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={(id) => router.push(`/post/${id}`)}
                  onOpenProfile={(userId) => router.push(`/profile/${userId}`)}
                />
              ))
            )}
          </View>
        )}

        {tab === 'about' && (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Informações</Text>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Email</Text>
                <Text style={styles.aboutValue}>{user.email}</Text>
              </View>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Membro desde</Text>
                <Text style={styles.aboutValue}>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav active="feed" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  coverSection: {
    width: '100%',
    height: COVER_HEIGHT,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileHeader: {
    marginTop: -50,
    marginBottom: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#e2e8f0',
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0856d6',
  },
  profileNameContainer: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonPrimary: {
    backgroundColor: '#0ea5e9',
  },
  actionButtonSecondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ratingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  ratingButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ratingButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#0ea5e9',
  },
  ratingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0ea5e9',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0ea5e9',
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  aboutSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  aboutItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  aboutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 14,
    color: '#64748b',
  },
});
