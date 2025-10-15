import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatusSuccess } from 'expo-av';
import { X } from 'lucide-react-native';

export type StorySegment = {
  id: string;
  type: 'image' | 'video';
  uri: string;
  durationMs?: number;
};

export type StoryUser = {
  name: string;
  avatar: string;
};

export type StoryViewerProps = {
  visible?: boolean;
  user: StoryUser;
  segments: StorySegment[];
  onClose: () => void;
  mode?: 'modal' | 'inline';
};

export default function StoryViewer({
  visible = false,
  user,
  segments,
  onClose,
  mode = 'modal',
}: StoryViewerProps) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const videoRef = useRef<Video | null>(null);
  const [isPaused, setPaused] = useState(false);
  const current = useMemo(() => segments[index], [segments, index]);
  const progress = useRef(new Animated.Value(0)).current;

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

  // Image timer auto-advance + progress animation
  useEffect(() => {
    if (mode === 'modal' && !visible) return;
    if (!current) return;

    progress.stopAnimation();
    progress.setValue(0);

    if (current.type === 'image') {
      const dur = Math.max(1500, current.durationMs ?? 5000);
      const anim = Animated.timing(progress, {
        toValue: 1,
        duration: dur,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      anim.start(({ finished }) => {
        if (finished) goNext();
      });
      return () => progress.stopAnimation();
    }
  }, [mode, visible, current, goNext, progress]);

  // Reset/pause when segment changes
  useEffect(() => {
    setPaused(false);
    if (videoRef.current) {
      videoRef.current.stopAsync().catch(() => {});
      videoRef.current.setPositionAsync(0).catch(() => {});
    }
  }, [index]);

  const progressItems = useMemo(
    () => segments.map((_, i) => ({ filled: i < index, active: i === index })),
    [segments, index],
  );

  const Body = (
    <View style={[styles.container]}>
      {/* Media full-bleed */}
      <View style={styles.mediaWrapperFull}>
        {current?.type === 'image' ? (
          <Image
            source={{ uri: current.uri }}
            resizeMode="cover"
            style={styles.media}
          />
        ) : (
          <Video
            ref={(r) => (videoRef.current = r)}
            style={styles.media}
            source={{ uri: current?.uri ?? '' }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            shouldPlay={!isPaused}
            onPlaybackStatusUpdate={(s) => {
              const st = s as AVPlaybackStatusSuccess;
              if (!('isLoaded' in st) || !st.isLoaded) return;
              if (st.durationMillis && st.positionMillis >= 0) {
                const ratio = Math.min(
                  1,
                  st.positionMillis / Math.max(st.durationMillis, 1),
                );
                progress.setValue(ratio);
              }
              if (st.didJustFinish) {
                goNext();
              }
            }}
          />
        )}
      </View>

      {/* Tap zones (absolute) */}
      <Pressable style={styles.leftZone} onPress={goPrev} />
      <Pressable style={styles.rightZone} onPress={goNext} />

      {/* Top overlay: progress + header */}
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.progressRow}>
          {progressItems.map((p, i) => (
            <View key={i} style={styles.progressTrack}>
              {p.filled ? (
                <View style={styles.progressFilled} />
              ) : p.active ? (
                <Animated.View
                  style={[
                    styles.progressActive,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              ) : null}
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
    </View>
  );

  if (mode === 'inline') return Body;

  return (
    <Modal
      visible={!!visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.modalSizer, { width, height }]}>{Body}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSizer: { flex: 1 },
  container: { flex: 1, backgroundColor: '#000000' },
  mediaWrapperFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  media: { width: '100%', height: '100%' },
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
  },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFilled: { width: '100%', height: '100%', backgroundColor: '#ffffff' },
  progressActive: { height: '100%', backgroundColor: '#ffffff' },
  headerRow: {
    marginTop: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  userName: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  closeBtn: { padding: 4 },
  leftZone: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '35%' },
  rightZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '35%',
  },
});
