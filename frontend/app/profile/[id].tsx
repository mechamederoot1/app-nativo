import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import UserProfileView from '../../components/UserProfileView';
import {
  getUserById,
  getUserPosts,
  getCurrentUser,
  ApiUser,
  ApiPost,
} from '../../utils/api';
import { profileData as defaultProfileData } from '../../screens/Profile/Data';
import { getMyProfile, getProfileById } from '../../utils/api';

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
  const [editable, setEditable] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

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

        let currentUserId: number | null = null;
        try {
          const currentUser = await getCurrentUser();
          currentUserId = currentUser.id;
        } catch {
          currentUserId = null;
        }

        const user = await getUserById(userIdentifier);
        const posts = await getUserPosts(userIdentifier);

        if (!mounted) return;

        const isOwnProfile = currentUserId === user.id;
        setEditable(isOwnProfile);
        setUserId(user.id);

        const fullName = `${user.first_name} ${user.last_name}`;
        const username =
          user.username ||
          `${user.first_name}${user.last_name}`
            .toLowerCase()
            .replace(/\s+/g, '');

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

        // fetch profile details (real data) if available
        let profileDetails: any = null;
        try {
          if (isOwnProfile) {
            profileDetails = await getMyProfile();
          } else {
            profileDetails = await getProfileById(userIdentifier);
          }
        } catch (e) {
          profileDetails = null;
        }

        const mappedProfile = {
          // base identity
          name: fullName,
          username: username,
          avatar: user.profile_photo || defaultProfileData.avatar,
          cover: user.cover_photo || defaultProfileData.cover,

          // personal info — prefer saved values, otherwise empty (no mocks)
          bio: profileDetails?.bio ?? '',
          hometown: profileDetails?.hometown ?? '',
          currentCity: profileDetails?.current_city ?? '',
          relationshipStatus: profileDetails?.relationship_status ?? '',
          workplace:
            profileDetails?.workplace_company && profileDetails?.workplace_title
              ? `${profileDetails.workplace_company} • ${profileDetails.workplace_title}`
              : (profileDetails?.workplace_company ?? ''),
          connectionsCount: profileDetails?.connections_count ?? 0,
          contact_email: profileDetails?.contact_email ?? '',

          // lists
          positions: Array.isArray(profileDetails?.positions)
            ? profileDetails.positions.map((p: any) => ({
                company: p.company,
                title: p.title,
                start: p.start,
                end: p.end,
              }))
            : [],
          education: Array.isArray(profileDetails?.education)
            ? profileDetails.education.map((e: any) => ({
                institution: e.institution,
                degree: e.degree,
                start: e.start,
                end: e.end,
              }))
            : [],

          // keep placeholder arrays for UI sections that are not yet implemented server-side
          recentFriends: defaultProfileData.recentFriends,
          testimonials: defaultProfileData.testimonials,
          highlights: defaultProfileData.highlights,
        };

        setProfile(mappedProfile);

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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <UserProfileView
      profile={profile}
      posts={userPosts}
      editable={editable}
      userId={userId}
    />
  );
}
