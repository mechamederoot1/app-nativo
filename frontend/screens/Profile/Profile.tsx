import React from 'react';
import { View, Text, Image, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomNav from '../../components/BottomNav';
import PostCard from '../../components/PostCard';
import TopBar from '../../components/TopBar';

const MOCK_POSTS = [
  { id: 'p1', user: 'Você', content: 'Primeiro post no meu perfil!', time: '1d', likes: 5, comments: [] },
  { id: 'p2', user: 'Você', content: 'Adorei a experiência aqui.', time: '3d', likes: 2, comments: [] },
];

export default function ProfileScreen(){
  return (
    <SafeAreaView style={{flex:1}}>
      <TopBar />
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        <View style={styles.coverWrap}>
          <Image source={{uri: 'https://picsum.photos/900/300?random=5'}} style={styles.cover} />
        </View>

        <View style={styles.metaWrap}>
          <View style={styles.avatarWrap}>
            <Image source={{uri: 'https://i.pravatar.cc/150?img=56'}} style={styles.avatar} />
          </View>
          <View style={{alignItems: 'center', marginTop: 8}}>
            <Text style={styles.name}>Nome do Usuário</Text>
            <Text style={styles.handle}>@seuusuario</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.bio}>Esta é a minha bio — desenvolvedor, amante de tecnologia e café. Aqui compartilho minhas ideias e projetos.</Text>

          <View style={styles.rowStats}>
            <View style={styles.stat}><Text style={styles.statNumber}>120</Text><Text style={styles.statLabel}>Posts</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>2.4k</Text><Text style={styles.statLabel}>Seguidores</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>320</Text><Text style={styles.statLabel}>Seguindo</Text></View>
          </View>
        </View>

        <View style={{paddingHorizontal:16, marginTop:12}}>
          <Text style={{fontSize:18,fontWeight:'700',marginBottom:8}}>Depoimentos</Text>
          <View style={{backgroundColor:'#fff', padding:12, borderRadius:8}}>
            <Text style={{color:'#374151'}}>“Ótimo profissional, recomendo!” — Maria</Text>
          </View>
        </View>

        <View style={{paddingHorizontal:16, marginTop:12}}>
          <Text style={{fontSize:18,fontWeight:'700',marginBottom:8}}>Posts</Text>
          {MOCK_POSTS.map(p => <PostCard key={p.id} post={p} />)}
        </View>
      </ScrollView>

      <BottomNav active="profile" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  coverWrap:{width:'100%',height:140,backgroundColor:'#f3f4f6'},
  cover:{width:'100%',height:140},
  metaWrap:{alignItems:'center', marginTop:-40},
  avatarWrap:{width:96,height:96,borderRadius:48,overflow:'hidden',borderWidth:4,borderColor:'#fff',backgroundColor:'#fff'},
  avatar:{width:96,height:96},
  name:{fontSize:20,fontWeight:'800',color:'#111827'},
  handle:{color:'#6b7280'},
  infoCard:{backgroundColor:'#fff',marginTop:12,padding:16,paddingBottom:20,borderRadius:8,marginHorizontal:16},
  sectionTitle:{fontSize:16,fontWeight:'700',marginBottom:8},
  bio:{color:'#374151',lineHeight:20},
  rowStats:{flexDirection:'row',justifyContent:'space-between',marginTop:12},
  stat:{alignItems:'center'},
  statNumber:{fontWeight:'700',fontSize:16},
  statLabel:{color:'#6b7280'}
});
