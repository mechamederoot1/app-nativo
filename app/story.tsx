import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';
import {
  Story,
  setStories,
  setActiveIndex,
} from '../frontend/contexts/StoryStore';

const INITIAL: Story[] = [
  {
    id: 's1',
    user: 'Alice',
    text: 'Primeiro story comentado!',
    image: 'https://picsum.photos/900/1600?random=21',
    comments: [
      { id: 'c1', user: 'Bruno', text: 'Ficou massa!' },
      { id: 'c2', user: 'Carla', text: 'Adorei a ideia 👏' },
    ],
    reactions: { '❤️': 3, '🔥': 2 },
  },
  {
    id: 's2',
    user: 'Bruno',
    image: 'https://picsum.photos/900/1600?random=22',
    text: 'Curtindo o dia 🌞',
    comments: [{ id: 'c3', user: 'Alice', text: 'Show!' }],
    reactions: { '👍': 1 },
  },
];

function genMore(start: number, count = 10): Story[] {
  return Array.from({ length: count }).map((_, i) => {
    const idNum = start + i + 1;
    return {
      id: 's' + idNum,
      user: 'Usuário ' + idNum,
      text: 'Story #' + idNum,
      image: `https://picsum.photos/900/1600?random=${100 + idNum}`,
      comments: [],
      reactions: {},
    } as Story;
  });
}

export default function StoryListScreen() {
  const router = useRouter();
  const [composer, setComposer] = useState('');
  const [data, setData] = useState<Story[]>(INITIAL);
  const [loadingMore, setLoadingMore] = useState(false);

  const pickMedia = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const uri = URL.createObjectURL(file);
          const newStory: Story = {
            id: String(Date.now()),
            user: 'Você',
            text: '',
            image: uri,
            comments: [],
            reactions: {},
          };
          setData((prev) => [newStory, ...prev]);
          setStories([newStory, ...data]);
        };
        input.click();
        return;
      }

      // Native: try to dynamically import expo-image-picker
      const module = await import('expo-image-picker');
      const ImagePicker: any = module;
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à galeria para adicionar um story.',
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
      });
      if (res.cancelled) return;
      const uri =
        res.assets && res.assets[0] ? res.assets[0].uri : (res.uri as string);
      const newStory: Story = {
        id: String(Date.now()),
        user: 'Você',
        text: '',
        image: uri,
        comments: [],
        reactions: {},
      };
      setData((prev) => [newStory, ...prev]);
      setStories([newStory, ...data]);
    } catch (err) {
      Alert.alert(
        'Erro',
        "Não foi possível abrir a galeria. Instale 'expo-image-picker' e reinicie o app.",
      );
    }
  }, [data]);

  const openViewer = useCallback(
    (idx: number) => {
      setStories(data);
      setActiveIndex(idx);
      const id = data[idx]?.id;
      if (!id) return;
      router.push(`/story/${id}`);
    },
    [data, router],
  );

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setData((prev) => [...prev, ...genMore(prev.length, 8)]);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore]);

  const renderItem = useCallback(
    ({ item, index }: { item: Story; index: number }) => (
      <TouchableOpacity
        onPress={() => openViewer(index)}
        activeOpacity={0.85}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.subtitle}>{item.text || 'Story'}</Text>
          </View>
        </View>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.preview} />
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Comentários: {item.comments.length}</Text>
          <Text style={styles.meta}>
            Reações:{' '}
            {Object.values(item.reactions || {}).reduce(
              (a, b) => a + (b || 0),
              0,
            )}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [openViewer],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar />

      <View style={styles.composerRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={pickMedia}
          accessibilityLabel="Adicionar story"
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.addLabel}>Adicionar Story</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator color="#0856d6" />
            </View>
          ) : null
        }
      />

      <BottomNav active="story" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0856d6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  addLabel: { marginLeft: 8, fontWeight: '700', color: '#0f172a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#0856d6', fontWeight: '700' },
  user: { fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#6b7280', marginTop: 2 },
  preview: { width: '100%', height: 200, borderRadius: 10, marginTop: 10 },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: { color: '#6b7280', fontSize: 12 },
});
