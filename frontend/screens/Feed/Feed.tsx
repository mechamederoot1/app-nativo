import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PostCard from '../../components/PostCard';
import BottomNav from '../../components/BottomNav';
import CreatePost from '../../components/CreatePost';
import TopBar from '../../components/TopBar';

type Post = {
  id: string;
  user: string;
  content: string;
  time: string;
  image?: string;
  likes?: number;
  liked?: boolean;
  comments: { id: string; user: string; text: string }[];
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user: 'Alice',
    content:
      'Olá, esta é minha primeira postagem! Adoro construir coisas com React Native ❤️',
    time: '2h',
    image: 'https://picsum.photos/800/600?random=1',
    likes: 12,
    liked: false,
    comments: [{ id: 'c1', user: 'Bruno', text: 'Que massa!' }],
  },
  {
    id: '2',
    user: 'Bruno',
    content: 'Curtindo o dia e construindo um app incrível. #dev',
    time: '3h',
    likes: 4,
    liked: false,
    comments: [
      { id: 'c2', user: 'Alice', text: 'Bora!' },
      { id: 'c3', user: 'Carla', text: 'Top' },
    ],
  },
  {
    id: '3',
    user: 'Carla',
    content: 'Compartilhando uma foto do meu café ☕️',
    time: '4h',
    image: 'https://picsum.photos/800/600?random=2',
    likes: 21,
    liked: false,
    comments: [],
  },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts((prev) => [...prev]);
      setRefreshing(false);
    }, 800);
  }, []);

  const handleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? Math.max((post.likes || 0) - 1, 0)
                : (post.likes || 0) + 1,
            }
          : post,
      ),
    );
  }, []);

  const handleCreate = useCallback((content: string) => {
    const newPost: Post = {
      id: String(Date.now()),
      user: 'Você',
      content,
      time: 'agora',
      likes: 0,
      liked: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <TopBar />
      <View style={styles.content}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onLike={handleLike} />
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
