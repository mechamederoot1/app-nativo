import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  ChevronRight,
  UserPlus,
  Clock,
} from 'lucide-react-native';
import {
  getProfileVisits,
  getCurrentUser,
  sendFriendRequest,
  type VisitorInfo,
  absoluteUrl,
} from '../utils/api';

const getDimensions = () => {
  if (Platform.OS === 'web') {
    return { width: typeof window !== 'undefined' ? window.innerWidth : 375 };
  }
  return Dimensions.get('window');
};
const { width } = getDimensions();

export default function VisitsScreen() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [visits, setVisits] = useState<VisitorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadVisits();
  }, [timeFilter]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    })();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const data = await getProfileVisits(user.id, timeFilter);
      setVisits(data);
    } catch (error) {
      console.error('Error loading visits:', error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (visitorId: number) => {
    try {
      setProcessingId(visitorId);
      await sendFriendRequest(visitorId);
      setVisits(visits.map(v =>
        v.visitor_id === visitorId
          ? { ...v, has_sent_friend_request: true }
          : v
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const navigateToProfile = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  const navigateToProfile = (userId) => {
    // Navegação para o perfil
    console.log('Navigate to profile:', userId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <View style={styles.content}>
        <Text style={styles.title}>Visitas</Text>

        {/* Filtros de Tempo */}
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterBtn, timeFilter === 'all' && styles.filterActive]}
            onPress={() => setTimeFilter('all')}
          >
            <Text style={[styles.filterText, timeFilter === 'all' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, timeFilter === 'hoje' && styles.filterActive]}
            onPress={() => setTimeFilter('hoje')}
          >
            <Text style={[styles.filterText, timeFilter === 'hoje' && styles.filterTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, timeFilter === 'essa semana' && styles.filterActive]}
            onPress={() => setTimeFilter('essa semana')}
          >
            <Text style={[styles.filterText, timeFilter === 'essa semana' && styles.filterTextActive]}>
              Essa semana
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, timeFilter === 'esse mês' && styles.filterActive]}
            onPress={() => setTimeFilter('esse mês')}
          >
            <Text style={[styles.filterText, timeFilter === 'esse mês' && styles.filterTextActive]}>
              Esse mês
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.visitCard}>
              <View style={styles.visitInfo}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />

                <View style={styles.visitDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.isPremium && (
                      <Star size={14} color="#eab308" fill="#eab308" strokeWidth={2} />
                    )}
                    {item.isVerified && (
                      <Shield size={14} color="#3b82f6" fill="#3b82f6" strokeWidth={2} />
                    )}
                  </View>

                  <View style={styles.timeRow}>
                    <Clock size={12} color="#94a3b8" strokeWidth={2} />
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                </View>

                {item.hasInvite ? (
                  <View style={styles.inviteActions}>
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={styles.acceptBtnText}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn}>
                      <Text style={styles.rejectBtnText}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => navigateToProfile(item.id)}
                  >
                    <ChevronRight size={20} color="#94a3b8" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <BottomNav active="visits" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  visitCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  visitDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: 13,
    color: '#64748b',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rejectBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  profileBtn: {
    padding: 8,
  },
});
