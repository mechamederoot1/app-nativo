import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

import PostCard from '../../components/PostCard';
import BottomNav from '../../components/BottomNav';
import CreatePost from '../../components/CreatePost';
import TopBar from '../../components/TopBar';

type StoryItemType = {
  id: string;
  user?: string;
  isAdd?: boolean;
};

const MOCK_POSTS = [
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
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const stories = useMemo<StoryItemType[]>(
    () => [
      { id: 'add', user: 'Adicionar', isAdd: true },
      { id: 's1', user: 'Alice' },
      { id: 's2', user: 'Bruno' },
      { id: 's3', user: 'Carla' },
      { id: 's4', user: 'Diego' },
    ],
    [],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts((prev) => [...prev]);
      setRefreshing(false);
    }, 800);
  }, []);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? (p.likes || 0) - 1 : (p.likes || 0) + 1,
            }
          : p,
      ),
    );
  };

  const handleCreate = (content: string) => {
    const newPost = {
      id: String(Date.now()),
      user: 'Você',
      content,
      time: 'agora',
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const renderStory = useCallback(({ item }: { item: StoryItemType }) => {
    if (item.isAdd) {
      return (
        <View style={styles.storyItem}>
          <View style={styles.addStoryCircle}>
            <Plus size={24} color="#0856d6" />
          </View>
          <Text style={styles.addStoryLabel}>Adicionar</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
        <Image
          source={{ uri: `https://i.pravatar.cc/100?u=${item.id}` }}
          style={styles.storyAvatar}
        />
        <Text style={styles.storyLabel}>{item.user}</Text>
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <TopBar />
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stories</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storiesCard}>
          <FlatList
            data={stories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
            keyExtractor={(item) => item.id}
            renderItem={renderStory}
          />
        </View>

        <CreatePost onCreate={handleCreate} />

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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0856d6',
  },
  storiesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  storiesList: {
    paddingRight: 4,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 58,
  },
  storyAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#0856d6',
  },
  storyLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#0f172a',
    textAlign: 'center',
  },
  addStoryCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#0856d6',
    borderStyle: 'dashed',
    backgroundColor: '#f3f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStoryLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#0856d6',
    fontWeight: '600',
  },
  postsList: {
    paddingBottom: 120,
  },
});
