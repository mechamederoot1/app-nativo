import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Plus, Eye, User } from 'lucide-react-native';

function MessageBubble({ active }: { active?: boolean }) {
  return (
    <View style={[styles.msgBubble, active && styles.msgBubbleActive]}>
      <View style={[styles.msgInner, active && styles.msgInnerActive]} />
    </View>
  );
}

function BottomNavInner({ active }: { active?: 'feed' | 'create' | 'messages' | 'visits' | 'profile' }) {
  const router = useRouter();
  const go = useCallback((path: string) => () => router.push(path), [router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={go('/feed')}>
        <Home size={20} color={active === 'feed' ? '#0856d6' : '#6b7280'} />
        <Text style={[styles.label, active === 'feed' && styles.active]}>Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={go('/create')}>
        <Plus size={20} color={active === 'create' ? '#0856d6' : '#6b7280'} />
        <Text style={[styles.label, active === 'create' && styles.active]}>Criar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={go('/messages')}>
        <View>
          <MessageBubble active={active === 'messages'} />
          {/* badge for unread messages */}
          {/** will be filled via context at runtime by reading UnreadContext in a wrapper */}
        </View>
        <Text style={[styles.label, active === 'messages' && styles.active]}>Mensagens</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={go('/visits')}>
        <View>
          <Eye size={20} color={active === 'visits' ? '#0856d6' : '#6b7280'} />
        </View>
        <Text style={[styles.label, active === 'visits' && styles.active]}>Visitas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={go('/profile')}>
        <User size={20} color={active === 'profile' ? '#0856d6' : '#6b7280'} />
        <Text style={[styles.label, active === 'profile' && styles.active]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

import { useUnread } from '../contexts/UnreadContext';

function BottomNavWithBadges(props: { active?: 'feed' | 'create' | 'messages' | 'visits' | 'profile' }) {
  const { unreadMessages, unreadVisits } = useUnread();
  // Render the inner nav but overlay badges by cloning structure
  return (
    <View>
      <BottomNavInner active={props.active} />
      {/* Overlay badges positioned near tabs — simple absolute positioned badges */}
      {/* Since BottomNavInner uses flex layout, we place badges absolutely relative to screen width */}
      <View style={styles.badgeOverlay} pointerEvents="none">
        {/* messages badge */}
        {unreadMessages > 0 && (
          <View style={[styles.overlayBadge, { left: '38%' }]}>
            <Text style={styles.badgeTextSmall}>{unreadMessages}</Text>
          </View>
        )}
        {/* visits badge */}
        {unreadVisits > 0 && (
          <View style={[styles.overlayBadge, { left: '68%' }]}>
            <Text style={styles.badgeTextSmall}>{unreadVisits}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(BottomNavWithBadges);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: '#374151',
    fontSize: 12,
    marginTop: 2,
  },
  active: {
    color: '#0856d6',
    fontWeight: '700',
  },
  msgBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBubbleActive: {
    backgroundColor: '#0856d6',
  },
  msgInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94a3b8',
  },
  msgInnerActive: {
    backgroundColor: '#fff',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 44,
    left: 0,
    right: 0,
    height: 0,
  },
  overlayBadge: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTextSmall: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  }
});
