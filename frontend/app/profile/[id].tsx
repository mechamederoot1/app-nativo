import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import UserProfileView from '../../components/UserProfileView';
import { profileData as seed } from '../../screens/Profile/Data';

export default function ProfileIdView() {
  const { id } = useLocalSearchParams();
  const idStr = String(id ?? '').trim().toLowerCase();
  const displayName = idStr ? idStr.replace(/[._-]+/g, ' ') : seed.name;
  const [profile, setProfile] = React.useState({
    ...seed,
    name: displayName,
    username: idStr || seed.username,
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await import('../../utils/api');
        const posts = await api.getPosts();
        const toSlug = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();
        const match = posts.find((p) => toSlug(p.user_name) === idStr);
        if (!mounted) return;
        if (match) {
          setProfile((prev) => ({
            ...prev,
            name: match.user_name,
            avatar: api.absoluteUrl(match.user_profile_photo) || prev.avatar,
            cover: api.absoluteUrl(match.user_cover_photo) || prev.cover,
          }));
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [idStr]);

  return <UserProfileView profile={profile} editable={false} />;
}
