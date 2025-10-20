import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import UserProfileView from '../../components/UserProfileView';
import { profileData } from '../../screens/Profile/Data';

export default function ProfileIdView() {
  const { id } = useLocalSearchParams();
  const idStr = String(id ?? '').trim();
  const displayName = idStr ? idStr.replace(/[._-]+/g, ' ') : profileData.name;
  const derived = {
    ...profileData,
    name: displayName,
    username: idStr || profileData.username,
  };
  return <UserProfileView profile={derived} editable={false} />;
}
