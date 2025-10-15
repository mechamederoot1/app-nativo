import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Image } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatusSuccess } from 'expo-av';
import { X } from 'lucide-react-native';

export type StorySegment = {
  id: string;
  type: 'image' | 'video';
  uri: string;
  durationMs?: number; // for images only
};

export type StoryUser = {
  name: string;
  avatar: string;
};

export type StoryViewerProps = {
  visible: boolean;
  user: StoryUser;
  segments: StorySegment[];
  onClose: () => void;
};

export default function StoryViewer({ visible, user, segments, onClose }: StoryViewerProps) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const videoRef = useRef<Video | null>(null);
  const [isPaused, setPaused] = useState(false);
  const current = useMemo(() => segments[index], [segments, index]);

  // Advance helpers
  const goNext = useCallback(() => {
    if (index < segments.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [index, segments.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  // Image timer auto-advance
  useEffect(() => {
    if (!visible) return;
    if (!current) return;
    if (current.type !== 'image') return;
    const timeout = setTimeout(goNext, Math.max(1500, current.durationMs ?? 5000));
    return () => clearTimeout(timeout);
  }, [visible, current, goNext]);

  // Reset/pause when segment changes
  useEffect(() => {
    setPaused(false);
    if (videoRef.current) {
      videoRef.current.stopAsync().catch(() => {});
      videoRef.current.setPositionAsync(0).catch(() => {});
      // play will be triggered by shouldPlay derived from isPaused
    }
  }, [index]);

  // Progress bar calculation
  const progressItems = useMemo(() => {
    return segments.map((seg, i) => ({
      filled: i < index,
      active: i === index,
    }));
  }, [segments, index]);

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.container, { width, height }]}> 
        {/* Top Overlay: progress and header */}
        <SafeAreaView style={styles.safeTop}>
          <View style={styles.progressRow}>
            {progressItems.map((p, i) => (
              <View key={i} style={styles.progressTrack}>
                <View style={[styles.progressFill, p.filled && styles.progressFilled, p.active && styles.progressActive]} />
              </View>
            ))}
          </View>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
              <X size={20} color="#ffffff" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Content area with tap zones */}
        <View style={styles.content}>
          {/* Left tap to go previous */}
          <Pressable style={styles.sideZone} onPress={goPrev} />

          {/* Media */}
          <View style={styles.mediaWrapper}>
            {current?.type === 'image' ? (
              <Image source={{ uri: current.uri }} resizeMode="cover" style={{ width, height }} />
            ) : (
              <Video
                ref={(r) => (videoRef.current = r)}
                style={{ width, height }}
                source={{ uri: current?.uri ?? '' }}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                isLooping={false}
                shouldPlay={!isPaused}
                onPlaybackStatusUpdate={(s) => {
                  const st = s as AVPlaybackStatusSuccess;
                  if (!('isLoaded' in st) || !st.isLoaded) return;
                  if (st.didJustFinish) {
                    goNext();
                  }
                }}
              />
            )}
          </View>

          {/* Right tap to go next */}
          <Pressable style={styles.sideZone} onPress={goNext} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '0%',
    height: '100%',
  },
  progressFilled: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  progressActive: {
    width: '40%',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    marginTop: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideZone: {
    width: '20%',
    height: '100%',
  },
  mediaWrapper: {
    width: '60%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
