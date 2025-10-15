import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';
import StoryViewer, {
  StorySegment,
  StoryUser,
} from '../frontend/components/StoryViewer';

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
    cover:
      'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1200&q=80',
    segments: [
      {
        id: 'a1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4500,
      },
      {
        id: 'a2',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1520975568316-9f2b98d1a0d9?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4500,
      },
      {
        id: 'a3',
        type: 'video',
        uri: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    ],
  },
  {
    id: 'diego',
    user: { name: 'Diego Andrade', avatar: 'https://i.pravatar.cc/160?img=12' },
    postedAt: 'há 5 horas',
    caption: 'Lançamos hoje nossa nova funcionalidade! 🚀',
    cover:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    segments: [
      {
        id: 'd1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4000,
      },
      {
        id: 'd2',
        type: 'video',
        uri: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
      },
      {
        id: 'd3',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=80',
        durationMs: 5000,
      },
    ],
  },
  {
    id: 'carla',
    user: { name: 'Carla Sousa', avatar: 'https://i.pravatar.cc/160?img=48' },
    postedAt: 'ontem',
    caption: 'Workshop de pesquisa na comunidade. 🎤',
    cover:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    segments: [
      {
        id: 'c1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4500,
      },
      {
        id: 'c2',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4500,
      },
      {
        id: 'c3',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80',
        durationMs: 4500,
      },
    ],
  },
];

export default function StoryScreen() {
  const { width, height } = useWindowDimensions();
  const [active, setActive] = useState<StoryItem | null>(null);
  const listRef = useRef<FlatList<StoryItem>>(null);

  const open = useCallback((s: StoryItem) => setActive(s), []);
  const close = useCallback(() => setActive(null), []);

  const cardWidth = Math.min(360, width - 60);
  const cardHeight = Math.max(140, Math.min(220, Math.floor(height * 0.28)));
  const itemWidth = cardWidth + 40;

  const renderItem = useCallback(
    ({ item }: { item: StoryItem }) => (
      <View style={{ width: itemWidth, paddingHorizontal: 20 }}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => open(item)}>
          <View style={styles.storyCard}>
            <ImageBackground
              source={{ uri: item.cover }}
              style={{
                height: cardHeight,
                width: cardWidth,
                alignSelf: 'center',
                justifyContent: 'flex-end',
              }}
              imageStyle={styles.storyImageInner}
            >
              <View style={styles.storyOverlay} />
              <View style={styles.storyContent}>
                <View style={styles.storyHeader}>
                  <Image
                    source={{ uri: item.user.avatar }}
                    style={styles.storyAvatar}
                  />
                  <View>
                    <Text style={styles.storyName}>{item.user.name}</Text>
                    <Text style={styles.storyTime}>{item.postedAt}</Text>
                  </View>
                </View>
                <Text style={styles.storyCaption}>{item.caption}</Text>
              </View>
            </ImageBackground>
          </View>
        </TouchableOpacity>
      </View>
    ),
    [open, itemWidth, cardHeight, cardWidth],
  );

  const keyExtractor = useCallback((i: StoryItem) => i.id, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Stories</Text>
        <Text style={styles.listSubtitle}>
          Deslize para o lado para ver outros. Toque para abrir em tela cheia.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {}}
          style={styles.addCard}
        >
          <View style={styles.addCircle}>
            <Plus size={28} color="#0856d6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addTitle}>Adicionar novo story</Text>
            <Text style={styles.addSubtitle}>
              Compartilhe um momento especial com quem te acompanha.
            </Text>
          </View>
        </TouchableOpacity>

        {STORIES.slice(0, 2).map((s) => (
          <TouchableOpacity
            key={`compact-${s.id}`}
            activeOpacity={0.9}
            onPress={() => setActive(s)}
            style={styles.compactCard}
          >
            <View style={styles.compactHeader}>
              <Image source={{ uri: s.user.avatar }} style={styles.compactAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.compactName}>{s.user.name}</Text>
                <Text style={styles.compactTime}>{s.postedAt}</Text>
              </View>
            </View>
            <ImageBackground
              source={{ uri: s.cover }}
              style={styles.compactMedia}
              imageStyle={{ resizeMode: 'cover' }}
            >
              <View style={styles.compactOverlay} />
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      {listHeader}
      <FlatList
        ref={listRef}
        data={STORIES}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      <BottomNav active="story" />

      {active ? (
        <StoryViewer
          visible
          user={active.user}
          segments={active.segments}
          onClose={close}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listHeader: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
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
  compactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 10,
    width: '100%',
    maxWidth: 220,
    alignSelf: 'center',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  compactTime: {
    fontSize: 12,
    color: '#64748b',
  },
  compactOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  compactMedia: {
    width: '100%',
    aspectRatio: 9/16,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
});
