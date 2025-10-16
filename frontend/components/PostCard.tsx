import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useImageDimensions } from '../hooks/useImageDimensions';

type Comment = { id: string; user: string; text: string };

type Post = {
  id: string;
  user: string;
  avatar?: string;
  content: string;
  time: string;
  image?: string;
  likes?: number;
  liked?: boolean;
  comments?: Comment[];
};

export default function PostCard({
  post,
  onLike,
  onOpen,
}: {
  post: Post;
  onLike?: (id: string) => void;
  onOpen?: (id: string) => void;
}) {
  const { dimensions } = useImageDimensions(post.image);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.85}
        onPress={() => onOpen && onOpen(post.id)}
      >
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {post.user.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.user}>{post.user}</Text>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onOpen && onOpen(post.id)}
        style={{ marginTop: 10 }}
      >
        <Text style={styles.content}>{post.content}</Text>
      </TouchableOpacity>

      {post.image && dimensions ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onOpen && onOpen(post.id)}
        >
          <Image
            source={{ uri: post.image }}
            style={[
              styles.image,
              {
                aspectRatio: dimensions.aspectRatio,
              },
            ]}
          />
        </TouchableOpacity>
      ) : post.image && !dimensions ? (
        <View style={[styles.image, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => onLike && onLike(post.id)}
        >
          <Heart size={18} color={post.liked ? '#e11d48' : '#6b7280'} />
          <Text style={[styles.actionText, { marginLeft: 8 }]}>
            {post.likes ?? 0}
          </Text>
        </TouchableOpacity>

        <View style={styles.action}>
          <MessageCircle size={18} color="#6b7280" />
          <Text style={[styles.actionText, { marginLeft: 8 }]}>
            {(post.comments || []).length}
          </Text>
        </View>

        <View style={styles.action}>
          <Share2 size={18} color="#6b7280" />
          <Text style={[styles.actionText, { marginLeft: 8 }]}>
            Compartilhar
          </Text>
        </View>
      </View>

      {(post.comments || []).slice(0, 2).map((c) => (
        <View key={c.id} style={styles.commentRow}>
          <Text style={styles.commentUser}>{c.user}</Text>
          <Text style={styles.commentText}> {c.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#0856d6',
    fontWeight: '700',
  },
  user: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    color: '#111827',
  },
  image: {
    width: '100%',
    maxHeight: 500,
    borderRadius: 10,
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#6b7280',
  },
  commentRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentUser: {
    fontWeight: '700',
    color: '#111827',
  },
  commentText: {
    color: '#374151',
    marginLeft: 6,
  },
});
