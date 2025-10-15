import React, { useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
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
  cover: string;
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
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<StoryItem>>(null);

  const renderItem = useCallback(({ item }: { item: StoryItem }) => {
    return (
      <View style={{ width, flex: 1 }}>
        <StoryViewer
          mode="inline"
          visible
          user={item.user}
          segments={item.segments}
          onClose={() => {}}
        />
      </View>
    );
  }, [width]);

  const keyExtractor = useCallback((i: StoryItem) => i.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={STORIES}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="start"
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
      </View>
      <BottomNav active="story" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
