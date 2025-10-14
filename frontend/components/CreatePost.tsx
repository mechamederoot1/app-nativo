import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function CreatePost({ onCreate }: { onCreate: (content: string) => void }) {
  const [text, setText] = useState('');

  const handlePost = () => {
    if (!text.trim()) return;
    onCreate(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="No que você está pensando?"
        placeholderTextColor="#9aa0a6"
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
      />
      <View style={styles.row}>
        <TouchableOpacity onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    fontSize: 14,
    color: '#111827',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e6e6e9',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  postButton: { backgroundColor: '#0856d6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  postText: { color: '#fff', fontWeight: '700' },
});
