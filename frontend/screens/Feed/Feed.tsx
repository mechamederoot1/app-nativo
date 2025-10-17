import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PostCard from '../../components/PostCard';
import BottomNav from '../../components/BottomNav';
import CreatePost from '../../components/CreatePost';
import TopBar from '../../components/TopBar';
import { useRouter } from 'expo-router';
import { subscribe, toggleLike, Post as StorePost } from '../../store/posts';

type Post = StorePost;

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const api = await import('../../utils/api');
        const data = await api.getPosts();
        const mapped = data.map((p) => ({
          id: String(p.id),
          user: p.user_name,
          content: p.content,
          time: new Date(p.created_at).toLocaleTimeString(),
          image: p.media_url || undefined,
          likes: 0,
          liked: false,
          comments: [],
        }));
        setPosts(mapped);
      } catch (e) {
        // fallback: keep empty if backend unavailable
        setPosts([]);
      }
    };
    load();
    const unsub = subscribe(() => {});
    return unsub;
  }, []);

  const onRefresh = useCallback(() => {
    (async () => {
      setRefreshing(true);
      try {
        const api = await import('../../utils/api');
        const data = await api.getPosts();
        const mapped = data.map((p) => ({
          id: String(p.id),
          user: p.user_name,
          content: p.content,
          time: new Date(p.created_at).toLocaleTimeString(),
          image: p.media_url || undefined,
          likes: 0,
          liked: false,
          comments: [],
        }));
        setPosts(mapped);
      } catch {
      } finally {
        setRefreshing(false);
      }
    })();
  }, []);

  const handleLike = useCallback((id: string) => {
    toggleLike(id);
  }, []);

  const handleCreate = useCallback((content: string) => {
    (async () => {
      try {
        const api = await import('../../utils/api');
        const created = await api.createPost(content);
        const newPost: Post = {
          id: String(created.id),
          user: created.user_name,
          content: created.content,
          time: new Date(created.created_at).toLocaleTimeString(),
          image: created.media_url || undefined,
          likes: 0,
          liked: false,
          comments: [],
        };
        setPosts((prev) => [newPost, ...prev]);
      } catch (e: any) {
        alert(e?.message || 'Falha ao publicar');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <TopBar />
      <View style={styles.content}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLike}
              onOpen={(id) => router.push(`/post/${id}`)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <CreatePost onCreate={handleCreate} />
              <View>
                <Text style={styles.feedTitle}>Feed</Text>
                <Text style={styles.feedSubtitle}>
                  Acompanhe atualizações em tempo real das pessoas que você
                  segue.
                </Text>
              </View>
            </View>
          }
        />
      </View>

      <BottomNav active="feed" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  postsList: {
    paddingBottom: 120,
  },
  listHeader: {
    gap: 16,
    marginBottom: 20,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
});
