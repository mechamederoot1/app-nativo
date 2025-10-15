import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PostCard from '../../frontend/components/PostCard';
import { addComment, getPost } from '../../frontend/store/posts';

export default function PostDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id ?? '');
  const post = useMemo(() => getPost(id), [id]);
  const [comment, setComment] = useState('');

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ padding: 16 }}>
          <Text style={styles.title}>Publicação não encontrada</Text>
          <Text style={styles.sub}>ID da publicação: {id}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddComment = () => {
    const t = comment.trim();
    if (!t) return;
    addComment(post.id, t);
    setComment('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            data={post.comments}
            keyExtractor={(c) => c.id}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                <PostCard post={post} />
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.title}>Comentários</Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <Text style={styles.commentText}> {item.text}</Text>
              </View>
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Adicionar um comentário..."
              placeholderTextColor="#9aa0a6"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Text style={styles.sendText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  sub: { marginTop: 4, color: '#475569' },
  commentRow: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  commentUser: { fontWeight: '700', color: '#111827' },
  commentText: { color: '#374151', marginLeft: 6 },
  inputBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0856d6',
    borderRadius: 10,
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
