import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import UserProfileView from '../../components/UserProfileView';
import { getUserById, getUserPosts, ApiUser, ApiPost } from '../../utils/api';
import { profileData as defaultProfileData } from '../../screens/Profile/Data';

type UserProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string | null;
  cover_photo?: string | null;
  created_at: string;
};

export default function UserProfilePage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState(defaultProfileData);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const userIdentifier = String(id ?? '').trim();

        if (!userIdentifier) {
          setError('ID do usuário não fornecido');
          setLoading(false);
          return;
        }

        const user = await getUserById(userIdentifier);
        const posts = await getUserPosts(userIdentifier);

        if (!mounted) return;

        const fullName = `${user.first_name} ${user.last_name}`;
        const username = user.username || `${user.first_name}${user.last_name}`.toLowerCase().replace(/\s+/g, '');

        const formattedPosts = posts.map((post: ApiPost) => ({
          id: post.id.toString(),
          userId: post.user_id,
          user: `${post.user_name}`,
          avatar: post.user_profile_photo || undefined,
          cover: post.user_cover_photo || undefined,
          content: post.content,
          time: new Date(post.created_at).toLocaleDateString('pt-BR'),
          image: post.media_url || undefined,
          likes: 0,
          liked: false,
          comments: [],
        }));

        setProfile({
          ...defaultProfileData,
          name: fullName,
          username: username,
          avatar: user.profile_photo || defaultProfileData.avatar,
          cover: user.cover_photo || defaultProfileData.cover,
        });

        setUserPosts(formattedPosts);
      } catch (err: any) {
        if (!mounted) return;
        console.error('Erro ao carregar perfil:', err);
        setError(err.message || 'Erro ao carregar perfil do usuário');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  return <UserProfileView profile={profile} posts={userPosts} editable={false} />;
}
