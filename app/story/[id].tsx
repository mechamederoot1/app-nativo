import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Dimensions,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNav from '../../frontend/components/BottomNav';
import TopBar from '../../frontend/components/TopBar';
import {
  getStories,
  getActiveIndex,
  setActiveIndex,
  setStories,
  Story,
} from '../../frontend/contexts/StoryStore';

const { width } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listRef = useRef<FlatList<Story>>(null);

  const initialData = useMemo(() => {
    const s = getStories();
    if (s && s.length) return s;
    // Fallback when opened directly
    return [
      {
        id: id || 's0',
        user: 'Usuário',
        text: 'Story',
        image: 'https://picsum.photos/900/1600?random=999',
        comments: [],
        reactions: {},
      },
    ];
  }, [id]);

  const [stories, setData] = useState<Story[]>(initialData);
  const [commentText, setCommentText] = useState('');
  const [active, setActive] = useState(() => {
    const idx = Math.max(getActiveIndex(), 0);
    return Math.min(idx, initialData.length - 1);
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setActive(idx);
      setActiveIndex(idx);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const addComment = useCallback(() => {
    const txt = commentText.trim();
    if (!txt) return;
    setData((prev) =>
      prev.map((s, idx) =>
        idx === active
          ? {
              ...s,
              comments: [
                ...s.comments,
                { id: String(Date.now()), user: 'Você', text: txt },
              ],
            }
          : s,
      ),
    );
    setCommentText('');
  }, [active, commentText]);

  const reactToStory = useCallback(
    (emoji: string) => {
      setData((prev) =>
        prev.map((s, idx) =>
          idx === active
            ? {
                ...s,
                reactions: {
                  ...(s.reactions || {}),
                  [emoji]: (s.reactions?.[emoji] || 0) + 1,
                },
              }
            : s,
        ),
      );
      setStories(prev => prev.map((s, idx) => idx === active ? { ...s, reactions: { ...(s.reactions || {}), [emoji]: (s.reactions?.[emoji] || 0) + 1 } } : s));
    },
    [active],
  );

  const renderItem = useCallback(({ item }: { item: Story }) => {
    return (
      <View style={{ width }}>
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.slide}
          imageStyle={styles.slideImage}
        >
          <View style={styles.slideHeader}>
            <Text style={styles.user}>{item.user}</Text>
          </View>
          {item.text ? (
            <View style={styles.centerWrap}>
              <Text style={styles.storyText}>{item.text}</Text>
            </View>
          ) : null}
          <View style={styles.reactionsBar}>
            {Object.entries(item.reactions || {}).map(([k, v]) => (
              <View key={k} style={styles.reactionChip}>
                <Text style={styles.reactionText}>{k} {v}</Text>
              </View>
            ))}
          </View>
          <View style={styles.commentsWrap}>
            <Text style={styles.commentsTitle}>Comentários</Text>
            <FlatList
              data={item.comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item: c }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}> {c.text}</Text>
                </View>
              )}
              style={{ maxHeight: 120 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <TopBar />

        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={stories}
          initialScrollIndex={active}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
        />

        <View style={styles.bottomBar}>
          <View style={styles.reactionButtons}>
            {['❤️', '🔥', '👍', '😂'].map((e) => (
              <TouchableOpacity key={e} onPress={() => reactToStory(e)} style={styles.reactionBtn}>
                <Text style={styles.reactionBtnText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.commentBar}>
            <TextInput
              placeholder="Comentar neste story..."
              placeholderTextColor="#9aa0a6"
              value={commentText}
              onChangeText={setCommentText}
              style={styles.commentInput}
            />
            <TouchableOpacity onPress={addComment} style={styles.commentBtn}>
              <Text style={styles.commentBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BottomNav active="story" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    height: 460,
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 10,
    alignSelf: 'center',
  },
  slideImage: { resizeMode: 'cover' },
  slideHeader: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 10 },
  user: { color: '#fff', fontWeight: '800' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  storyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
  },
  reactionsBar: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reactionChip: { backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  reactionText: { color: '#fff', fontWeight: '700' },
  commentsWrap: { backgroundColor: 'rgba(0,0,0,0.35)', padding: 10 },
  commentsTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  commentRow: { flexDirection: 'row', marginBottom: 4 },
  commentUser: { color: '#fff', fontWeight: '700' },
  commentText: { color: '#fff' },
  bottomBar: { paddingHorizontal: 16, gap: 8 },
  reactionButtons: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  reactionBtn: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  reactionBtnText: { fontSize: 16 },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  commentInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },
  commentBtn: {
    backgroundColor: '#0856d6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  commentBtnText: { color: '#fff', fontWeight: '700' },
});
