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
    const unsub = subscribe(() => setPosts(getPosts()));
    return unsub;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts(getPosts());
      setRefreshing(false);
    }, 400);
  }, []);

  const handleLike = useCallback((id: string) => {
    toggleLike(id);
  }, []);

  const handleCreate = useCallback((content: string) => {
    addPost(content);
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
