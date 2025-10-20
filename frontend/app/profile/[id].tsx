import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProfileIdView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const userId = String(id || '');

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<any>(null);
  const [posts, setPosts] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const api = await import('../../utils/api');
        const u = await api.getUserById(userId);
        const p = await api.getUserPosts(userId);
        if (!mounted) return;
        const BASE_URL =
          (typeof process !== 'undefined' &&
            (process as any).env &&
            (process as any).env.EXPO_PUBLIC_API_URL) ||
          'http://localhost:5050';
        const abs = (u?: string | null) =>
          u ? (u.startsWith('http') ? u : `${BASE_URL}${u}`) : undefined;
        setUser({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          avatar: abs(u.profile_photo),
          cover: abs(u.cover_photo),
        });
        const mapped = p.map((post: any) => ({
          id: String(post.id),
          user: post.user_name,
          avatar: abs(post.user_profile_photo),
          cover: abs(post.user_cover_photo),
          content: post.content,
          time: new Date(post.created_at).toLocaleTimeString(),
          image: abs(post.media_url),
          likes: 0,
          liked: false,
          comments: [],
        }));
        setPosts(mapped);
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />
        <View style={styles.center}> 
          <Text style={styles.sub}>Carregando…</Text>
        </View>
        <BottomNav active="profile" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />
        <View style={styles.center}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.sub}>{error || `ID: ${userId}`}</Text>
        </View>
        <BottomNav active="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: '#fff', marginBottom: 12 }}>
          {!!user.cover && (
            <Image source={{ uri: user.cover }} style={{ width: '100%', height: 200 }} />
          )}
          <View style={{ alignItems: 'center', marginTop: -65 }}>
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 130, height: 130, borderRadius: 65, borderWidth: 5, borderColor: '#fff', backgroundColor: '#e2e8f0' }}
            />
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 10 }}>
              {user.name}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {posts.length === 0 ? (
            <View style={styles.center}> 
              <Text style={styles.sub}>Nenhuma publicação</Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpen={(id) => router.push(`/post/${id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { marginTop: 6, color: '#64748b' },
  center: { padding: 16, alignItems: 'center', justifyContent: 'center' },
});
