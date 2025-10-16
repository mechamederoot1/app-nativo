import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import TopBar from '../../components/TopBar';
import ProfilePhotoEditor from '../../components/ProfilePhotoEditor';
import CoverPhotoEditor, { CoverTransform } from '../../components/CoverPhotoEditor';
import {
  Heart,
  Home,
  MapPin,
  Briefcase,
  Users,
  ChevronRight,
  FileText,
  Edit3,
  Globe,
  Mail,
  Calendar,
  Award,
  Camera,
  Plus,
  MoreVertical,
  Shield,
  Star,
  Link,
  Phone,
  GraduationCap,
  UserCheck,
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { profileData } from './Data';
import { getPosts, subscribe, toggleLike } from '../../store/posts';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const p = profileData;
  const [tab, setTab] = useState<'posts' | 'about' | 'photos'>('posts');
  const [posts, setPosts] = useState(getPosts());
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [coverEditorVisible, setCoverEditorVisible] = useState(false);
  const [selectedCoverUri, setSelectedCoverUri] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState(p.cover);
  const [coverTransform, setCoverTransform] = useState<CoverTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [profilePhoto, setProfilePhoto] = useState(p.avatar);

  useEffect(() => {
    const unsub = subscribe(() => setPosts(getPosts()));
    return unsub;
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permitir acesso à galeria de fotos para mudar sua foto de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      setEditorVisible(true);
    }
  };

  const handlePhotoSave = (imageUri: string, caption: string) => {
    setProfilePhoto(imageUri);
    setEditorVisible(false);
    setSelectedImageUri(null);
    Alert.alert(
      'Sucesso',
      `Foto atualizada${caption ? ` com legenda: "${caption}"` : ''}!`,
    );
  };

  const myPosts = useMemo(
    () => posts.filter((x) => x.user === 'Você'),
    [posts],
  );
  const postCount = myPosts.length;
  const connectionsCount = p.connectionsCount;

  const highlightsData = [
    { id: 1, name: 'Viagens', image: p.highlights[0], icon: '✈️' },
    { id: 2, name: 'Família', image: p.highlights[1], icon: '👨‍👩‍👧‍👦' },
    { id: 3, name: 'Trabalho', image: p.highlights[2], icon: '💼' },
    { id: 4, name: 'Amigos', image: p.highlights[3], icon: '🎉' },
    { id: 5, name: 'Hobbies', image: p.highlights[4], icon: '🎮' },
  ];

  const [ratings, setRatings] = useState({
    confiavel: 142,
    legal: 256,
    sexy: 89,
  });

  const [userVotes, setUserVotes] = useState({
    confiavel: false,
    legal: false,
    sexy: false,
  });

  const handleRating = (type: 'confiavel' | 'legal' | 'sexy') => {
    if (userVotes[type]) {
      return;
    }

    setRatings((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));

    setUserVotes((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.headerSection}>
          <View style={styles.coverContainer}>
            <Image source={{ uri: coverPhoto }} style={[styles.coverImage, { transform: [ { scale: coverTransform.scale }, { translateX: coverTransform.offsetX }, { translateY: coverTransform.offsetY } ] }]} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.coverGradient}
            />
            <TouchableOpacity style={styles.coverEditBtn} activeOpacity={0.8} onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Permitir acesso à galeria para alterar sua capa.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
              if (!result.canceled) {
                setSelectedCoverUri(result.assets[0].uri);
                setCoverEditorVisible(true);
              }
            }}>
              <Camera size={18} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.mainContainer}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
              <View style={styles.onlineDot} />
              <TouchableOpacity
                style={styles.avatarEditBtn}
                activeOpacity={0.8}
                onPress={pickImage}
              >
                <Camera size={14} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{p.name}</Text>
              <Shield size={18} color="#3b82f6" fill="#3b82f6" />
            </View>
            <Text style={styles.username}>@{p.username}</Text>

            <Text style={styles.bio}>{p.bio}</Text>

            <View style={styles.ratingsContainer}>
              <TouchableOpacity
                style={[
                  styles.ratingItem,
                  userVotes.confiavel && styles.ratingItemVoted,
                ]}
                activeOpacity={userVotes.confiavel ? 1 : 0.7}
                onPress={() => handleRating('confiavel')}
              >
                <Text style={styles.ratingEmoji}>😊</Text>
                <View style={styles.ratingInfo}>
                  <Text
                    style={[
                      styles.ratingLabel,
                      userVotes.confiavel && styles.ratingLabelVoted,
                    ]}
                  >
                    Confiável
                  </Text>
                  <Text
                    style={[
                      styles.ratingCount,
                      userVotes.confiavel && styles.ratingCountVoted,
                    ]}
                  >
                    {ratings.confiavel}
                  </Text>
                </View>
                {userVotes.confiavel && (
                  <View style={styles.votedIndicator}>
                    <Check size={12} color="#10b981" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.ratingDivider} />

              <TouchableOpacity
                style={[
                  styles.ratingItem,
                  userVotes.legal && styles.ratingItemVoted,
                ]}
                activeOpacity={userVotes.legal ? 1 : 0.7}
                onPress={() => handleRating('legal')}
              >
                <Text style={styles.ratingEmoji}>😎</Text>
                <View style={styles.ratingInfo}>
                  <Text
                    style={[
                      styles.ratingLabel,
                      userVotes.legal && styles.ratingLabelVoted,
                    ]}
                  >
                    Legal
                  </Text>
                  <Text
                    style={[
                      styles.ratingCount,
                      userVotes.legal && styles.ratingCountVoted,
                    ]}
                  >
                    {ratings.legal}
                  </Text>
                </View>
                {userVotes.legal && (
                  <View style={styles.votedIndicator}>
                    <Check size={12} color="#10b981" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.ratingDivider} />

              <TouchableOpacity
                style={[
                  styles.ratingItem,
                  userVotes.sexy && styles.ratingItemVoted,
                ]}
                activeOpacity={userVotes.sexy ? 1 : 0.7}
                onPress={() => handleRating('sexy')}
              >
                <Text style={styles.ratingEmoji}>💖</Text>
                <View style={styles.ratingInfo}>
                  <Text
                    style={[
                      styles.ratingLabel,
                      userVotes.sexy && styles.ratingLabelVoted,
                    ]}
                  >
                    Sexy
                  </Text>
                  <Text
                    style={[
                      styles.ratingCount,
                      userVotes.sexy && styles.ratingCountVoted,
                    ]}
                  >
                    {ratings.sexy}
                  </Text>
                </View>
                {userVotes.sexy && (
                  <View style={styles.votedIndicator}>
                    <Check size={12} color="#10b981" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
                <Edit3 size={16} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.primaryBtnText}>Editar perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#3b82f6" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
              >
                <MoreVertical size={18} color="#3b82f6" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.highlightsWrapper}>
              <View style={styles.highlightsHeader}>
                <Text style={styles.highlightsTitle}>Destaques</Text>
                <TouchableOpacity>
                  <Text style={styles.highlightsEdit}>Editar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.highlightsContainer}
              >
                {highlightsData.map((highlight) => (
                  <TouchableOpacity
                    key={highlight.id}
                    style={styles.highlightItem}
                    activeOpacity={0.9}
                  >
                    <View style={styles.highlightImageWrapper}>
                      <Image
                        source={{ uri: highlight.image }}
                        style={styles.highlightImage}
                      />
                      <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={styles.highlightOverlay}
                      />
                      <Text style={styles.highlightIcon}>{highlight.icon}</Text>
                    </View>
                    <Text style={styles.highlightName}>{highlight.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addHighlightItem}
                  activeOpacity={0.8}
                >
                  <View style={styles.addHighlightCircle}>
                    <Plus size={18} color="#64748b" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.addHighlightText}>Adicionar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Informações Pessoais</Text>
            <Pressable onPress={() => router.push('/profile/about')}>
              <ChevronRight size={20} color="#64748b" strokeWidth={2} />
            </Pressable>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Briefcase size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{p.workplace}</Text>
            </View>
            <View style={styles.infoItem}>
              <GraduationCap size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>USP - São Paulo</Text>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{p.currentCity}</Text>
            </View>
            <View style={styles.infoItem}>
              <Home size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{p.hometown}</Text>
            </View>
            <View style={styles.infoItem}>
              <Heart size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{p.relationshipStatus}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>Entrou em Janeiro 2020</Text>
            </View>
            <View style={styles.infoItem}>
              <Link size={18} color="#64748b" strokeWidth={2} />
              <Text style={[styles.infoText, styles.linkText]}>
                meusite.com.br
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Mail size={18} color="#64748b" strokeWidth={2} />
              <Text style={[styles.infoText, styles.linkText]}>
                contato@email.com
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.connectionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <UserCheck size={22} color="#3b82f6" strokeWidth={2.5} />
              <View>
                <Text style={styles.sectionTitle}>Conexões</Text>
                <Text style={styles.connectionsSubtitle}>
                  {p.connectionsCount} conexões · {p.recentFriends.length} em
                  comum
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.connectionsGrid}>
            {p.recentFriends.slice(0, 9).map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.connectionCard}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: friend.avatar }}
                  style={styles.connectionAvatar}
                />
                <Text style={styles.connectionName} numberOfLines={1}>
                  {friend.name.split(' ')[0]}
                </Text>
                <Text style={styles.connectionMutual}>2 em comum</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setTab('posts')}
              style={[styles.tabBtn, tab === 'posts' && styles.tabActive]}
            >
              <FileText
                size={18}
                color={tab === 'posts' ? '#3b82f6' : '#64748b'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === 'posts' && styles.tabTextActive,
                ]}
              >
                Posts
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab('photos')}
              style={[styles.tabBtn, tab === 'photos' && styles.tabActive]}
            >
              <Camera
                size={18}
                color={tab === 'photos' ? '#3b82f6' : '#64748b'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === 'photos' && styles.tabTextActive,
                ]}
              >
                Fotos
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab('about')}
              style={[styles.tabBtn, tab === 'about' && styles.tabActive]}
            >
              <Users
                size={18}
                color={tab === 'about' ? '#3b82f6' : '#64748b'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === 'about' && styles.tabTextActive,
                ]}
              >
                Sobre
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.tabContent}>
          {tab === 'posts' &&
            (myPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <FileText size={48} color="#cbd5e1" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma publicação ainda</Text>
                <Text style={styles.emptyDesc}>
                  Compartilhe seus momentos e pensamentos com seus amigos
                </Text>
                <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.85}>
                  <Plus size={18} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.emptyBtnText}>
                    Criar primeira publicação
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => toggleLike(post.id)}
                />
              ))
            ))}

          {tab === 'photos' && (
            <View style={styles.photosGrid}>
              {p.highlights.map((photo, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoItem}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {tab === 'about' && (
            <View>
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Biografia</Text>
                <Text style={styles.aboutText}>
                  {p.bio}
                  {'\n\n'}
                  Apaixonado por tecnologia e inovação, sempre buscando novos
                  desafios e oportunidades de crescimento. Acredito no poder da
                  colaboração e no impacto positivo que podemos criar juntos.
                </Text>
              </View>

              {p.testimonials && p.testimonials.length > 0 && (
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutTitle}>Depoimentos</Text>
                  {p.testimonials.map((t) => (
                    <View key={t.id} style={styles.testimonialCard}>
                      <Text style={styles.testimonialText}>"{t.text}"</Text>
                      <View style={styles.testimonialAuthor}>
                        <View style={styles.testimonialAvatar}>
                          <Text style={styles.testimonialAvatarText}>
                            {t.author.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.testimonialName}>— {t.author}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav active="profile" />

      {selectedImageUri && (
        <ProfilePhotoEditor
          imageUri={selectedImageUri}
          isVisible={editorVisible}
          onSave={handlePhotoSave}
          onCancel={() => {
            setEditorVisible(false);
            setSelectedImageUri(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  coverEditBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  mainContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    marginTop: -65,
    position: 'relative',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: '#ffffff',
    backgroundColor: '#e2e8f0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  bio: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  ratingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    position: 'relative',
  },
  ratingItemVoted: {
    opacity: 0.9,
  },
  ratingEmoji: {
    fontSize: 20,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  ratingLabelVoted: {
    color: '#10b981',
  },
  ratingCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 1,
  },
  ratingCountVoted: {
    color: '#10b981',
  },
  ratingDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  votedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 24,
  },
  highlightsWrapper: {
    width: '100%',
    marginTop: 24,
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  highlightsEdit: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  highlightsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  highlightItem: {
    alignItems: 'center',
  },
  highlightImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  highlightIcon: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontSize: 16,
  },
  highlightName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 6,
  },
  addHighlightItem: {
    alignItems: 'center',
  },
  addHighlightCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHighlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoGrid: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  linkText: {
    color: '#3b82f6',
  },
  connectionsSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '700',
  },
  connectionsSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  connectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  connectionCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
  },
  connectionAvatar: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  connectionName: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    marginTop: 6,
  },
  connectionMutual: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginHorizontal: -20,
  },
  photoItem: {
    width: (width - 8) / 3,
    aspectRatio: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  testimonialCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  testimonialAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  testimonialName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
});
