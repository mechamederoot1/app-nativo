import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, ImageBackground, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Plus } from 'lucide-react-native';
import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';
import StoryViewer, { StorySegment, StoryUser } from '../frontend/components/StoryViewer';

export type StoryItem = {
  id: string;
  user: StoryUser;
  postedAt: string;
  caption: string;
  cover: string; // cover image for the card
  segments: StorySegment[];
};

const STORIES: StoryItem[] = [
  {
    id: 'alice',
    user: { name: 'Alice Martins', avatar: 'https://i.pravatar.cc/160?img=21' },
    postedAt: 'há 2 horas',
    caption: 'Explorando novas referências para o próximo produto. ✨',
    cover: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1200&q=80',
    segments: [
      { id: 'a1', type: 'image', uri: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1600&q=80', durationMs: 4500 },
      { id: 'a2', type: 'image', uri: 'https://images.unsplash.com/photo-1520975568316-9f2b98d1a0d9?auto=format&fit=crop&w=1600&q=80', durationMs: 4500 },
      { id: 'a3', type: 'video', uri: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
  },
  {
    id: 'diego',
    user: { name: 'Diego Andrade', avatar: 'https://i.pravatar.cc/160?img=12' },
    postedAt: 'há 5 horas',
    caption: 'Lançamos hoje nossa nova funcionalidade! 🚀',
    cover: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    segments: [
      { id: 'd1', type: 'image', uri: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80', durationMs: 4000 },
      { id: 'd2', type: 'video', uri: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm' },
      { id: 'd3', type: 'image', uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=80', durationMs: 5000 },
    ],
  },
  {
    id: 'carla',
    user: { name: 'Carla Sousa', avatar: 'https://i.pravatar.cc/160?img=48' },
    postedAt: 'ontem',
    caption: 'Workshop de pesquisa na comunidade. 🎤',
    cover: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    segments: [
      { id: 'c1', type: 'image', uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80', durationMs: 4500 },
      { id: 'c2', type: 'image', uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80', durationMs: 4500 },
      { id: 'c3', type: 'image', uri: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80', durationMs: 4500 },
    ],
  },
];

export default function StoryScreen() {
  const [stories, setStories] = useState<StoryItem[]>(STORIES);
  const [active, setActive] = useState<StoryItem | null>(null);

  const open = useCallback((s: StoryItem) => setActive(s), []);
  const close = useCallback(() => setActive(null), []);

  const addStory = useCallback(() => {
    const id = String(Date.now());
    const me: StoryItem = {
      id,
      user: { name: 'Você', avatar: 'https://i.pravatar.cc/160?u=voce' },
      postedAt: 'agora mesmo',
      caption: 'Novo story compartilhado com a comunidade! ✨',
      cover: `https://picsum.photos/900/1600?random=${Math.floor(Math.random() * 1000)}`,
      segments: [
        { id: `${id}-1`, type: 'image', uri: `https://picsum.photos/900/1600?random=${Math.floor(Math.random() * 1000)}`, durationMs: 4500 },
        { id: `${id}-2`, type: 'image', uri: `https://picsum.photos/900/1600?random=${Math.floor(Math.random() * 1000)}`, durationMs: 4500 },
      ],
    };
    setStories((prev) => [me, ...prev]);
    setActive(me);
  }, []);

  const renderItem = useCallback(({ item }: { item: StoryItem }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => open(item)} style={styles.storyCard}>
      <ImageBackground source={{ uri: item.cover }} style={styles.storyImage} imageStyle={styles.storyImageInner}>
        <View style={styles.storyOverlay} />
        <View style={styles.storyContent}>
          <View style={styles.storyHeader}>
            <Image source={{ uri: item.user.avatar }} style={styles.storyAvatar} />
            <View>
              <Text style={styles.storyName}>{item.user.name}</Text>
              <Text style={styles.storyTime}>{item.postedAt}</Text>
            </View>
          </View>
          <Text style={styles.storyCaption}>{item.caption}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  ), [open]);

  const listHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Stories</Text>
      <Text style={styles.listSubtitle}>Role para descobrir e toque para ver em tela cheia. Stories avançam automaticamente.</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={addStory} style={styles.addCard}>
        <View style={styles.addCircle}>
          <Plus size={28} color="#0856d6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.addTitle}>Adicionar novo story</Text>
          <Text style={styles.addSubtitle}>Compartilhe um momento especial com quem te acompanha.</Text>
        </View>
      </TouchableOpacity>
    </View>
  ), [addStory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <FlatList
        data={stories}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
      <BottomNav active="story" />

      {active ? (
        <StoryViewer visible user={active.user} segments={active.segments} onClose={close} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    paddingTop: 16,
  },
  listHeader: {
    marginBottom: 20,
    gap: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  addCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0856d6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2fe',
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  addSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  storyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  storyImage: {
    height: 280,
    justifyContent: 'flex-end',
  },
  storyImageInner: { resizeMode: 'cover' },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.35)',
  },
  storyContent: {
    padding: 20,
    gap: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  storyTime: {
    fontSize: 12,
    color: '#e2e8f0',
  },
  storyCaption: {
    fontSize: 15,
    color: '#f8fafc',
    lineHeight: 22,
  },
});
