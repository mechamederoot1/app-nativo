import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView, Image } from 'react-native';
import PostCard from '../../components/PostCard';
import BottomNav from '../../components/BottomNav';
import CreatePost from '../../components/CreatePost';
import TopBar from '../../components/TopBar';

const MOCK_POSTS = [
  {
    id: '1',
    user: 'Alice',
    content: 'Olá, esta é minha primeira postagem! Adoro construir coisas com React Native ❤️',
    time: '2h',
    image: 'https://picsum.photos/800/600?random=1',
    likes: 12,
    liked: false,
    comments: [{ id: 'c1', user: 'Bruno', text: 'Que massa!' }],
  },
  {
    id: '2',
    user: 'Bruno',
    content: 'Curtindo o dia e construindo um app incrível. #dev',
    time: '3h',
    likes: 4,
    liked: false,
    comments: [{ id: 'c2', user: 'Alice', text: 'Bora!' }, { id: 'c3', user: 'Carla', text: 'Top' }],
  },
  {
    id: '3',
    user: 'Carla',
    content: 'Compartilhando uma foto do meu café ☕️',
    time: '4h',
    image: 'https://picsum.photos/800/600?random=2',
    likes: 21,
    liked: false,
    comments: [],
  },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network refresh
    setTimeout(() => {
      setPosts(prev => [...prev]);
      setRefreshing(false);
    }, 800);
  }, []);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: (p.liked ? (p.likes || 0) - 1 : (p.likes || 0) + 1) } : p));
  };

  const handleCreate = (content: string) => {
    const newPost = {
      id: String(Date.now()),
      user: 'Você',
      content,
      time: 'agora',
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <TopBar />
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111827' }}>
          <Text onPress={() => { /* left logo navigation handled in header, keep for compatibility */ }} style={{color:'#0856d6'}}>Vibe</Text>
        </Text>

        {/* Stories horizontal strip */}
        <FlatList
          data={[{id:'s1',user:'Alice'},{id:'s2',user:'Bruno'},{id:'s3',user:'Carla'}]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingVertical:8,paddingHorizontal:4,marginBottom:8}}
          keyExtractor={s=>s.id}
          renderItem={({item})=> (
            <View style={{alignItems:'center',marginRight:12}}>
              <Image source={{uri:`https://i.pravatar.cc/100?u=${item.id}`}} style={{width:64,height:64,borderRadius:32,borderWidth:2,borderColor:'#0856d6'}} />
              <Text style={{fontSize:12,marginTop:6}}>{item.user}</Text>
            </View>
          )}
        />

        <CreatePost onCreate={handleCreate} />

        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomNav active="feed" />
    </SafeAreaView>
  );
}
