import React, { useMemo, useRef, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, Dimensions, ImageBackground, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';

const { width } = Dimensions.get('window');

type Comment = { id: string; user: string; text: string };

type Story = {
  id: string;
  user: string;
  text?: string;
  image?: string;
  comments: Comment[];
};

const INITIAL_STORIES: Story[] = [
  {
    id: 's1',
    user: 'Alice',
    text: 'Primeiro story comentado!',
    image: 'https://picsum.photos/900/1600?random=21',
    comments: [
      { id: 'c1', user: 'Bruno', text: 'Ficou massa!' },
      { id: 'c2', user: 'Carla', text: 'Adorei a ideia 👏' },
    ],
  },
  {
    id: 's2',
    user: 'Bruno',
    image: 'https://picsum.photos/900/1600?random=22',
    text: 'Curtindo o dia 🌞',
    comments: [{ id: 'c3', user: 'Alice', text: 'Show!' }],
  },
];

export default function StoryScreen() {
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [composer, setComposer] = useState('');
  const [commentText, setCommentText] = useState('');
  const listRef = useRef<FlatList<Story>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const postStory = useCallback(() => {
    const text = composer.trim();
    if (!text) return;
    const newStory: Story = {
      id: String(Date.now()),
      user: 'Você',
      text,
      image: 'https://picsum.photos/900/1600?random=' + Math.floor(Math.random()*1000),
      comments: [],
    };
    setStories((prev) => [newStory, ...prev]);
    setComposer('');
    // jump to first (new) story
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 0);
  }, [composer]);

  const addComment = useCallback(() => {
    const txt = commentText.trim();
    if (!txt) return;
    setStories((prev) => prev.map((s, idx) => idx === activeIndex ? { ...s, comments: [...s.comments, { id: String(Date.now()), user: 'Você', text: txt }] } : s));
    setCommentText('');
  }, [activeIndex, commentText]);

  const renderItem = useCallback(({ item }: { item: Story }) => {
    return (
      <View style={{ width }}>
        <ImageBackground source={{ uri: item.image }} style={styles.slide} imageStyle={styles.slideImage}>
          <View style={styles.slideHeader}>
            <Text style={styles.user}>{item.user}</Text>
          </View>
          {item.text ? <View style={styles.centerWrap}><Text style={styles.storyText}>{item.text}</Text></View> : null}
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <TopBar />

        <View style={styles.composerCard}>
          <TextInput
            placeholder="Compartilhe um story..."
            placeholderTextColor="#9aa0a6"
            value={composer}
            onChangeText={setComposer}
            style={styles.composerInput}
          />
          <TouchableOpacity onPress={postStory} style={styles.composerBtn}>
            <Text style={styles.composerBtnText}>Postar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={stories}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
        />

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
  storyText: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', paddingHorizontal: 16, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 4 },
  commentsWrap: { backgroundColor: 'rgba(0,0,0,0.35)', padding: 10 },
  commentsTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  commentRow: { flexDirection: 'row', marginBottom: 4 },
  commentUser: { color: '#fff', fontWeight: '700' },
  commentText: { color: '#fff' },
  composerCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center' },
  composerInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },
  composerBtn: { backgroundColor: '#0856d6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  composerBtnText: { color: '#fff', fontWeight: '700' },
  commentBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 10, marginBottom: 6 },
  commentInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },
  commentBtn: { backgroundColor: '#0856d6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  commentBtnText: { color: '#fff', fontWeight: '700' },
});
