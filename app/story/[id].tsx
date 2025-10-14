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
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getStories,
  getActiveIndex,
  setActiveIndex,
  setStories,
  Story,
} from '../../frontend/contexts/StoryStore';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const [showComments, setShowComments] = useState(false);
  const [overlayWhite, setOverlayWhite] = useState(false);
  const insets = useSafeAreaInsets();

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setActive(idx);
      setActiveIndex(idx);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const addComment = useCallback((textParam?: string) => {
    const txt = (textParam ?? commentText).trim();
    if (!txt) return false;
    const newComment = { id: String(Date.now()), user: 'Você', text: txt };

    setData((prev) => {
      const next = prev.map((s, idx) =>
        idx === active
          ? {
              ...s,
              comments: [...s.comments, newComment],
            }
          : s,
      );
      setStories(next);
      return next;
    });

    setCommentText('');
    return true;
  }, [active, commentText]);

  const reactToStory = useCallback(
    (emoji: string) => {
      setData((prev) => {
        const next = prev.map((s, idx) =>
          idx === active
            ? {
                ...s,
                reactions: {
                  ...(s.reactions || {}),
                  [emoji]: (s.reactions?.[emoji] || 0) + 1,
                },
              }
            : s,
        );
        setStories(next);
        return next;
      });
    },
    [active],
  );

  const renderItem = useCallback(({ item }: { item: Story }) => {
    return (
      <View style={{ width, height }}>
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.slide}
          imageStyle={styles.slideImage}
        >
          <View style={styles.slideHeader} />

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

          <TouchableOpacity
            style={styles.commentsPreview}
            onPress={() => setShowComments(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.commentsPreviewText}>Comentários ({item.comments.length}) — tocar para ver</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Fullscreen story viewer (no TopBar / BottomNav to ensure true fullscreen) */}

        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={stories}
          initialScrollIndex={Math.min(active, stories.length - 1)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          style={{ flex: 1 }}
        />

        {/* Integrated comment / reaction bar matching story style */}
        {!showComments ? (
          <View style={[styles.inlineControls, { bottom: insets.bottom + 48 }]}>
            <View style={styles.reactionButtons}>
              {['❤️', '🔥', '👍', '😂'].map((e) => (
                <TouchableOpacity key={e} onPress={() => reactToStory(e)} style={styles.reactionBtn}>
                  <Text style={styles.reactionBtnText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.commentBarTranslucent}>
              <TextInput
                placeholder="Comentar neste story..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentInputTranslucent}
              />
              <TouchableOpacity
                onPress={() => {
                  const sent = addComment();
                  if (sent) {
                    setOverlayWhite(true);
                    setShowComments(true);
                  }
                }}
                style={styles.commentBtnTranslucent}
              >
                <Text style={styles.commentBtnText}>Comentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Comments overlay — same styling as story (dark, translucent) and integrated list */}
        {showComments ? (
          <View style={[styles.commentsOverlay, overlayWhite ? styles.commentsOverlayWhite : null]}>
            <View style={styles.commentsHeader}>
              <Text style={[styles.commentsHeaderText, overlayWhite ? styles.commentsHeaderTextWhite : null]}>Comentários</Text>
              <TouchableOpacity onPress={() => { setShowComments(false); setOverlayWhite(false); }}>
                <Text style={[styles.commentsClose, overlayWhite ? styles.commentsCloseWhite : null]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={stories[active]?.comments || []}
              keyExtractor={(c) => c.id}
              renderItem={({ item: c }) => (
                <View style={styles.commentRowOverlay}>
                  <Text style={[styles.commentUserOverlay, overlayWhite ? styles.commentUserOverlayWhite : null]}>{c.user}</Text>
                  <Text style={[styles.commentTextOverlay, overlayWhite ? styles.commentTextOverlayWhite : null]}> {c.text}</Text>
                </View>
              )}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator={false}
            />

            <View style={[styles.commentComposerOverlay, { paddingBottom: insets.bottom ? insets.bottom + 20 : 24 }]}>
              <TextInput
                placeholder="Escreva um comentário..."
                placeholderTextColor={overlayWhite ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)'}
                value={commentText}
                onChangeText={setCommentText}
                style={[styles.commentInputOverlay, overlayWhite ? styles.commentInputOverlayWhite : null]}
              />
              <TouchableOpacity onPress={() => { const sent = addComment(); if (sent) { setOverlayWhite(true); } }} style={styles.commentBtnOverlay}>
                <Text style={styles.commentBtnText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: { resizeMode: 'cover' },
  centerWrap: { position: 'absolute', top: '30%', left: 20, right: 20, alignItems: 'center' },
  storyText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
  },
  reactionsBar: {
    position: 'absolute',
    top: 40,
    right: 12,
    flexDirection: 'column',
    gap: 6,
  },
  reactionChip: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, marginBottom: 6 },
  reactionText: { color: '#fff', fontWeight: '700' },
  commentsPreview: { position: 'absolute', bottom: 120, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.45)', padding: 10, borderRadius: 12 },
  commentsPreviewText: { color: '#fff', textAlign: 'center' },

  inlineControls: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  reactionButtons: { flexDirection: 'row', marginBottom: 8 },
  reactionBtn: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginHorizontal: 6 },
  reactionBtnText: { fontSize: 16 },

  commentBarTranslucent: { flexDirection: 'row', alignItems: 'center', width: '92%', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  commentInputTranslucent: { flex: 1, color: '#fff', paddingVertical: 6, paddingHorizontal: 8 },
  commentBtnTranslucent: { marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  commentBtnText: { color: '#fff', fontWeight: '700' },

  commentsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  commentsOverlayWhite: { backgroundColor: '#fff', justifyContent: 'flex-start' },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  commentsHeaderText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  commentsHeaderTextWhite: { color: '#0f172a' },
  commentsClose: { color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  commentsCloseWhite: { color: '#6b7280' },
  commentRowOverlay: { flexDirection: 'row', marginBottom: 12 },
  commentUserOverlay: { color: '#fff', fontWeight: '800', marginRight: 8 },
  commentUserOverlayWhite: { color: '#0f172a' },
  commentTextOverlay: { color: '#fff', flex: 1 },
  commentTextOverlayWhite: { color: '#374151' },
  commentComposerOverlay: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  commentInputOverlay: { flex: 1, color: '#fff', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10 },
  commentInputOverlayWhite: { color: '#0f172a', backgroundColor: '#f8fafc' },
  commentBtnOverlay: { marginLeft: 8, backgroundColor: '#0856d6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
});
