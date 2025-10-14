import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { Plus, X, MessageCircle } from 'lucide-react-native';

import TopBar from '../frontend/components/TopBar';
import BottomNav from '../frontend/components/BottomNav';

type CommentSort = 'newest' | 'oldest';

type CommentAuthor = {
  name: string;
  avatar: string;
};

type Comment = {
  id: string;
  author: CommentAuthor;
  text: string;
  createdAt: string;
};

type StoryProfile = {
  name: string;
  avatar: string;
  relationship: string;
  hometown: string;
  currentCity: string;
  role: string;
  company: string;
};

type StoryMedia = {
  image: string;
  caption: string;
};

type Story = {
  id: string;
  profile: StoryProfile;
  media: StoryMedia;
  postedAt: string;
  comments: Comment[];
};

const BASE_STORIES: Story[] = [
  {
    id: 'story-1',
    profile: {
      name: 'Alice Martins',
      avatar: 'https://i.pravatar.cc/160?img=21',
      relationship: 'Solteira',
      hometown: 'Salvador, BA',
      currentCity: 'São Paulo, SP',
      role: 'Product Designer',
      company: 'Studio 42',
    },
    media: {
      image:
        'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=900&q=80',
      caption:
        'Explorando novas referências para o próximo produto. Inspiração está em todo lugar! ✨',
    },
    postedAt: 'há 2 horas',
    comments: [
      {
        id: 'c1',
        author: {
          name: 'Bruno Lima',
          avatar: 'https://i.pravatar.cc/160?img=31',
        },
        text: 'Incrível! Adorei as cores que você escolheu.',
        createdAt: '2024-05-01T16:30:00Z',
      },
      {
        id: 'c2',
        author: {
          name: 'Carla Sousa',
          avatar: 'https://i.pravatar.cc/160?img=45',
        },
        text: 'Quero muito ver o resultado final desse projeto! 👏',
        createdAt: '2024-05-01T15:10:00Z',
      },
      {
        id: 'c3',
        author: {
          name: 'Bruno Lima',
          avatar: 'https://i.pravatar.cc/160?img=31',
        },
        text: 'Se precisar de feedback, me chama!',
        createdAt: '2024-05-01T15:45:00Z',
      },
    ],
  },
  {
    id: 'story-2',
    profile: {
      name: 'Diego Andrade',
      avatar: 'https://i.pravatar.cc/160?img=12',
      relationship: 'Em relacionamento',
      hometown: 'Curitiba, PR',
      currentCity: 'Florianópolis, SC',
      role: 'CTO',
      company: 'OceanLab',
    },
    media: {
      image:
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80',
      caption:
        'Lançamos hoje nossa nova funcionalidade! Obrigado a todo o time pelo esforço. 🚀',
    },
    postedAt: 'há 5 horas',
    comments: [
      {
        id: 'c4',
        author: {
          name: 'Eduarda Campos',
          avatar: 'https://i.pravatar.cc/160?img=53',
        },
        text: 'Parabéns, Diego! Vocês merecem demais.',
        createdAt: '2024-05-01T12:00:00Z',
      },
      {
        id: 'c5',
        author: {
          name: 'Alice Martins',
          avatar: 'https://i.pravatar.cc/160?img=21',
        },
        text: 'Já testei e ficou super fluido!',
        createdAt: '2024-05-01T13:15:00Z',
      },
    ],
  },
  {
    id: 'story-3',
    profile: {
      name: 'Carla Sousa',
      avatar: 'https://i.pravatar.cc/160?img=48',
      relationship: 'Solteira',
      hometown: 'Recife, PE',
      currentCity: 'Recife, PE',
      role: 'UX Researcher',
      company: 'Semente Digital',
    },
    media: {
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
      caption:
        'Workshop de pesquisa com usuários rolando aqui na comunidade. Energia lá em cima! 🎤',
    },
    postedAt: 'ontem',
    comments: [
      {
        id: 'c6',
        author: {
          name: 'Bruno Lima',
          avatar: 'https://i.pravatar.cc/160?img=31',
        },
        text: 'Obrigado por compartilhar o material com a gente.',
        createdAt: '2024-04-30T19:20:00Z',
      },
    ],
  },
];

function formatRelativeTime(isoDate: string) {
  const created = Date.parse(isoDate);
  const diffMs = Date.now() - created;
  if (Number.isNaN(created)) return '';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'agora mesmo';
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const days = Math.floor(diffMs / day);
  if (days < 7) {
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  return new Date(created).toLocaleDateString('pt-BR');
}

type StoryViewerProps = {
  story: Story;
  onClose: () => void;
};

function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [sort, setSort] = useState<CommentSort>('newest');

  const groupedComments = useMemo(() => {
    const ordered = [...story.comments].sort((a, b) => {
      const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      return sort === 'newest' ? -diff : diff;
    });

    const groups = new Map<
      string,
      { author: CommentAuthor; comments: Comment[] }
    >();

    ordered.forEach((comment) => {
      const existing = groups.get(comment.author.name);
      if (existing) {
        existing.comments.push(comment);
      } else {
        groups.set(comment.author.name, {
          author: comment.author,
          comments: [comment],
        });
      }
    });

    return Array.from(groups.values());
  }, [sort, story.comments]);

  const profileDetails = useMemo(
    () => [
      { label: 'Relacionamento', value: story.profile.relationship },
      { label: 'Cidade natal', value: story.profile.hometown },
      { label: 'Cidade atual', value: story.profile.currentCity },
      { label: 'Cargo', value: story.profile.role },
      { label: 'Emprego', value: story.profile.company },
    ],
    [story.profile],
  );

  return (
    <Modal animationType="slide" transparent>
      <View style={styles.viewerOverlay}>
        <SafeAreaView style={styles.viewerSafeArea}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.viewerContent}
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground
              source={{ uri: story.media.image }}
              style={styles.viewerHero}
              imageStyle={styles.viewerHeroImage}
            >
              <View style={styles.viewerHeroGradient} />
              <TouchableOpacity style={styles.viewerCloseBtn} onPress={onClose}>
                <X size={20} color="#f8fafc" />
              </TouchableOpacity>
              <View style={styles.viewerHeroInfo}>
                <View style={styles.viewerAvatarWrapper}>
                  <Image
                    source={{ uri: story.profile.avatar }}
                    style={styles.viewerAvatar}
                  />
                  <View style={styles.viewerHeroText}>
                    <Text style={styles.viewerName}>{story.profile.name}</Text>
                    <Text style={styles.viewerTime}>{story.postedAt}</Text>
                  </View>
                </View>
                <Text style={styles.viewerCaption}>{story.media.caption}</Text>
              </View>
            </ImageBackground>

            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Informações básicas</Text>
              <View style={styles.profileGrid}>
                {profileDetails.map((detail) => (
                  <View key={detail.label} style={styles.profileItem}>
                    <Text style={styles.profileLabel}>{detail.label}</Text>
                    <Text style={styles.profileValue}>{detail.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.commentsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Comentários</Text>
                <Text style={styles.sectionSubtitle}>
                  Discussão da comunidade sobre este story.
                </Text>
              </View>
              <View style={styles.filtersRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    sort === 'newest' && styles.filterChipActive,
                  ]}
                  onPress={() => setSort('newest')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      sort === 'newest' && styles.filterChipTextActive,
                    ]}
                  >
                    Mais recentes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    sort === 'oldest' && styles.filterChipActive,
                  ]}
                  onPress={() => setSort('oldest')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      sort === 'oldest' && styles.filterChipTextActive,
                    ]}
                  >
                    Mais antigos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.commentsContainer}>
              {groupedComments.map((group) => (
                <View key={group.author.name} style={styles.commentGroup}>
                  <View style={styles.commentGroupHeader}>
                    <Image
                      source={{ uri: group.author.avatar }}
                      style={styles.commentAuthorAvatar}
                    />
                    <Text style={styles.commentAuthorName}>
                      {group.author.name}
                    </Text>
                  </View>
                  {group.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTime}>
                        {formatRelativeTime(comment.createdAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              {groupedComments.length === 0 && (
                <View style={styles.emptyComments}>
                  <MessageCircle size={32} color="#94a3b8" />
                  <Text style={styles.emptyCommentsTitle}>
                    Seja o primeiro a comentar
                  </Text>
                  <Text style={styles.emptyCommentsSubtitle}>
                    Compartilhe sua opinião para continuar a conversa.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function StoryScreen() {
  const [stories, setStories] = useState<Story[]>(BASE_STORIES);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleOpenStory = useCallback((story: Story) => {
    setSelectedStory(story);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedStory(null);
  }, []);

  const handleAddStory = useCallback(() => {
    const newStory: Story = {
      id: String(Date.now()),
      profile: {
        name: 'Você',
        avatar: 'https://i.pravatar.cc/160?u=voce',
        relationship: 'Compartilhando momento',
        hometown: 'Cidade natal não informada',
        currentCity: 'Cidade atual não informada',
        role: 'Criador de conteúdo',
        company: 'Rede Vibe',
      },
      media: {
        image: `https://picsum.photos/900/1600?random=${Math.floor(Math.random() * 1000)}`,
        caption: 'Novo story compartilhado com a comunidade! ✨',
      },
      postedAt: 'agora mesmo',
      comments: [],
    };

    setStories((prev) => [newStory, ...prev]);
    setSelectedStory(newStory);
  }, []);

  const renderStory = useCallback<ListRenderItem<Story>>(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleOpenStory(item)}
        style={styles.storyCard}
      >
        <ImageBackground
          source={{ uri: item.media.image }}
          style={styles.storyCardImage}
          imageStyle={styles.storyCardImageInner}
        >
          <View style={styles.storyCardOverlay} />
          <View style={styles.storyCardContent}>
            <View style={styles.storyCardHeader}>
              <Image
                source={{ uri: item.profile.avatar }}
                style={styles.storyCardAvatar}
              />
              <View>
                <Text style={styles.storyCardName}>{item.profile.name}</Text>
                <Text style={styles.storyCardTime}>{item.postedAt}</Text>
              </View>
            </View>
            <Text style={styles.storyCardCaption}>{item.media.caption}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleOpenStory],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Stories</Text>
            <Text style={styles.listSubtitle}>
              Role para descobrir momentos compartilhados pela comunidade.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddStory}
              style={styles.addStoryCard}
            >
              <View style={styles.addStoryCircle}>
                <Plus size={28} color="#0856d6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addStoryTitle}>Adicionar novo story</Text>
                <Text style={styles.addStorySubtitle}>
                  Compartilhe um momento especial com quem te acompanha.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
      <BottomNav active="story" />

      {selectedStory ? (
        <StoryViewer story={selectedStory} onClose={handleCloseViewer} />
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
  addStoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  addStoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0856d6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2fe',
  },
  addStoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  addStorySubtitle: {
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
  storyCardImage: {
    height: 280,
    justifyContent: 'flex-end',
  },
  storyCardImageInner: {
    resizeMode: 'cover',
  },
  storyCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.35)',
  },
  storyCardContent: {
    padding: 20,
    gap: 16,
  },
  storyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  storyCardTime: {
    fontSize: 12,
    color: '#e2e8f0',
  },
  storyCardCaption: {
    fontSize: 15,
    color: '#f8fafc',
    lineHeight: 22,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 14, 0.92)',
  },
  viewerSafeArea: {
    flex: 1,
  },
  viewerContent: {
    paddingBottom: 64,
  },
  viewerHero: {
    height: 480,
    justifyContent: 'flex-end',
  },
  viewerHeroImage: {
    resizeMode: 'cover',
  },
  viewerHeroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 11, 26, 0.35)',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerHeroInfo: {
    padding: 24,
    gap: 16,
  },
  viewerAvatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  viewerHeroText: {
    gap: 4,
  },
  viewerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  viewerTime: {
    fontSize: 13,
    color: '#e2e8f0',
  },
  viewerCaption: {
    fontSize: 16,
    lineHeight: 24,
    color: '#f8fafc',
  },
  profileCard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#cbd5f5',
    marginTop: 4,
  },
  profileGrid: {
    marginTop: 16,
    rowGap: 14,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.25)',
    paddingBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 15,
    color: '#e2e8f0',
  },
  commentsHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 12,
    backgroundColor: 'rgba(8, 11, 26, 0.92)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    color: '#cbd5f5',
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#f8fafc',
  },
  commentsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'rgba(8, 11, 26, 0.92)',
    gap: 24,
  },
  commentGroup: {
    gap: 12,
  },
  commentGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentAuthorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentAuthorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  commentCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  commentText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyComments: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyCommentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  emptyCommentsSubtitle: {
    fontSize: 13,
    color: '#cbd5f5',
    textAlign: 'center',
    lineHeight: 20,
  },
});
