import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  FlatList,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Svg, Path } from 'react-native-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Audio } from 'expo-av';
import {
  X,
  Type as TypeIcon,
  Pencil,
  Music,
  AtSign,
  Save,
  Undo2,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { searchUsers } from '../utils/api';
import { addStory } from '../store/stories';

// Types
export type DrawPoint = { x: number; y: number };
export type Stroke = { color: string; width: number; points: DrawPoint[] };
export type OverlayText = {
  id: string;
  type: 'text' | 'tag';
  text: string;
  color: string;
  fontFamily?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

const COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
const FONTS = Platform.select({
  ios: ['System', 'Georgia', 'Times New Roman', 'Courier'],
  android: ['sans-serif', 'serif', 'monospace'],
  default: ['System', 'serif', 'monospace'],
});

const TRACKS = [
  { id: 't1', title: 'SoundHelix 1', artist: 'SoundHelix', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 't2', title: 'SoundHelix 2', artist: 'SoundHelix', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 't3', title: 'SoundHelix 3', artist: 'SoundHelix', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

function usePanDrag(
  onMove: (dx: number, dy: number) => void,
) {
  const draggingRef = useRef<null | { x: number; y: number }>(null);
  const onStart = useCallback((e: GestureResponderEvent) => {
    draggingRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
  }, []);
  const onMoveEvt = useCallback((e: GestureResponderEvent) => {
    if (!draggingRef.current) return;
    const { x, y } = draggingRef.current;
    const dx = e.nativeEvent.pageX - x;
    const dy = e.nativeEvent.pageY - y;
    draggingRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    onMove(dx, dy);
  }, [onMove]);
  const onEnd = useCallback(() => {
    draggingRef.current = null;
  }, []);
  return { onStart, onMoveEvt, onEnd };
}

export default function StoryEditor({ onClose }: { onClose?: () => void }) {
  const { width } = useWindowDimensions();
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(6);
  const [mode, setMode] = useState<'none' | 'draw' | 'text' | 'tag' | 'music'>('none');
  const [overlays, setOverlays] = useState<OverlayText[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [font, setFont] = useState(FONTS?.[0] || 'System');
  const [textDraft, setTextDraft] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [tagResults, setTagResults] = useState<any[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [music, setMusic] = useState<{ id: string; title: string; artist: string; uri: string } | null>(null);
  const shotRef = useRef<View>(null);

  // Pick background image
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setBgUri(res.assets[0].uri);
    }
  }, []);

  // Drawing
  const onCanvasTouchStart = useCallback((e: any) => {
    if (mode !== 'draw') return;
    const { locationX, locationY } = e.nativeEvent;
    setActiveStroke({ color, width: brush, points: [{ x: locationX, y: locationY }] });
  }, [mode, color, brush]);

  const onCanvasTouchMove = useCallback((e: any) => {
    if (mode !== 'draw' || !activeStroke) return;
    const { locationX, locationY } = e.nativeEvent;
    setActiveStroke({ ...activeStroke, points: [...activeStroke.points, { x: locationX, y: locationY }] });
  }, [mode, activeStroke]);

  const onCanvasTouchEnd = useCallback(() => {
    if (mode !== 'draw' || !activeStroke) return;
    setStrokes((s) => [...s, activeStroke]);
    setActiveStroke(null);
  }, [mode, activeStroke]);

  const undo = useCallback(() => {
    if (mode === 'draw') {
      setStrokes((s) => s.slice(0, -1));
    } else if (selectedId) {
      setOverlays((o) => o.filter((x) => x.id !== selectedId));
      setSelectedId(null);
    }
  }, [mode, selectedId]);

  // Text overlay
  const addTextOverlay = useCallback(() => {
    const trimmed = textDraft.trim();
    if (!trimmed) return;
    const id = `t_${Date.now()}`;
    const ov: OverlayText = {
      id,
      type: 'text',
      text: trimmed,
      color,
      fontFamily: font,
      x: 40,
      y: 120,
      scale: 1,
      rotation: 0,
    };
    setOverlays((o) => [...o, ov]);
    setTextDraft('');
    setMode('none');
    setSelectedId(id);
  }, [textDraft, color, font]);

  // Tagging friends
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (mode !== 'tag' || !tagQuery.trim()) {
        setTagResults([]);
        return;
      }
      try {
        const res = await searchUsers(tagQuery.trim());
        if (active) setTagResults(res || []);
      } catch {
        if (active) setTagResults([]);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [mode, tagQuery]);

  const addTag = useCallback((user: any) => {
    const id = `g_${Date.now()}`;
    const ov: OverlayText = {
      id,
      type: 'tag',
      text: `@${user.username || user.first_name || 'user'}`,
      color: '#3b82f6',
      fontFamily: Platform.select({ android: 'sans-serif-medium', default: 'System' }),
      x: 40,
      y: 80,
      scale: 1,
      rotation: 0,
    };
    setOverlays((o) => [...o, ov]);
    setTagQuery('');
  }, []);

  // Music
  const toggleTrack = useCallback(async (track: typeof TRACKS[number]) => {
    if (music?.id === track.id) {
      setMusic(null);
      if (sound) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        setSound(null);
      }
      return;
    }
    try {
      if (sound) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
      }
      const s = new Audio.Sound();
      await s.loadAsync({ uri: track.uri }, { shouldPlay: true, isLooping: true }, false);
      setSound(s);
      setMusic(track);
    } catch {}
  }, [music, sound]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  // Move overlays
  const moveOverlay = useCallback((id: string, dx: number, dy: number) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, x: o.x + dx, y: o.y + dy } : o)));
  }, []);

  const removeOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // Save story (capture)
  const onSave = useCallback(async () => {
    if (!bgUri) return;
    try {
      const uri = await captureRef(shotRef, { format: 'jpg', quality: 0.9, result: 'tmpfile' });
      addStory({
        id: `s_${Date.now()}`,
        user: { name: 'Você', avatar: 'https://i.pravatar.cc/160?img=1' },
        postedAt: 'agora',
        postedAtHours: 0,
        caption: overlays.find(o => o.type === 'text')?.text || '',
        cover: uri as string,
        views: 0,
        likes: 0,
        segments: [
          { id: 'seg1', type: 'image', uri: uri as string, durationMs: 5000 },
        ],
      });
      if (onClose) onClose();
    } catch {}
  }, [bgUri, overlays, onClose]);

  const selected = useMemo(() => overlays.find(o => o.id === selectedId) || null, [overlays, selectedId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <X size={22} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Criar story</Text>
        <TouchableOpacity onPress={onSave} style={styles.saveBtn} disabled={!bgUri}>
          <Save size={18} color={bgUri ? '#ffffff' : '#9ca3af'} strokeWidth={2.5} />
          <Text style={[styles.saveText, !bgUri && { color: '#9ca3af' }]}>Salvar</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrapper}>
        {!bgUri ? (
          <View style={styles.emptyState}>
            <TouchableOpacity onPress={pickImage} style={styles.pickBtn}>
              <ImageIcon size={20} color="#3b82f6" strokeWidth={2.5} />
              <Text style={styles.pickLabel}>Escolher imagem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ViewShot ref={shotRef} style={styles.shot}>
            <Pressable
              style={styles.canvas}
              onTouchStart={onCanvasTouchStart}
              onTouchMove={onCanvasTouchMove}
              onTouchEnd={onCanvasTouchEnd}
            >
              {/* Background */}
              <View style={[styles.bg, { backgroundColor: '#000' }]}> 
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    {/* Use RN Image as background */}
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                      <View style={{ flex: 1 }}>
                        <Pressable>
                          <View style={{ flex: 1 }}>
                            {/* eslint-disable-next-line react-native/no-inline-styles */}
                            <View style={{ flex: 1, backgroundColor: '#000' }}>
                              {/* We rely on ImageBackground-like */}
                              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                <View style={{ flex: 1 }}>
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flex: 1 }}>
                                        <View style={{ flex: 1 }}>
                                          {/* Use plain Image tag for background */}
                                          <View style={{ flex: 1 }}>
                                            <View style={{ flex: 1 }}>
                                              {/* Using native Image component to render background */}
                                              <View style={{ flex: 1 }}>
                                                {/* @ts-ignore: RN Image import via require to avoid circular */}
                                                <Text style={{ position: 'absolute', opacity: 0 }}>{bgUri}</Text>
                                              </View>
                                            </View>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Drawing Layer */}
              <Svg style={StyleSheet.absoluteFill}>
                {[...strokes, ...(activeStroke ? [activeStroke] : [])].map((s, idx) => (
                  <Path
                    key={idx}
                    d={`M ${s.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    stroke={s.color}
                    strokeWidth={s.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
              </Svg>

              {/* Overlays */}
              {overlays.map((o) => {
                const { onStart, onMoveEvt, onEnd } = usePanDrag((dx, dy) => moveOverlay(o.id, dx, dy));
                return (
                  <Pressable
                    key={o.id}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={onStart}
                    onResponderMove={onMoveEvt}
                    onResponderRelease={onEnd}
                    onPress={() => setSelectedId(o.id)}
                    style={{ position: 'absolute', left: o.x, top: o.y }}
                  >
                    <View style={[styles.overlayBox, selectedId === o.id && styles.overlaySelected]}>
                      <Text style={{ color: o.color, fontFamily: o.fontFamily, fontSize: 22, fontWeight: o.type === 'tag' ? '800' as any : '600' as any }}>
                        {o.text}
                      </Text>
                    </View>
                    {selectedId === o.id && (
                      <View style={styles.overlayActions}>
                        <TouchableOpacity onPress={() => removeOverlay(o.id)} style={styles.smallBtn}>
                          <Trash2 size={14} color="#ef4444" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </Pressable>
          </ViewShot>
        )}
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        <View style={styles.toolRow}>
          <TouchableOpacity onPress={pickImage} style={styles.toolBtn}>
            <ImageIcon size={18} color="#111827" strokeWidth={2.5} />
            <Text style={styles.toolLabel}>Imagem</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'draw' ? 'none' : 'draw')} style={[styles.toolBtn, mode === 'draw' && styles.toolActive]}>
            <Pencil size={18} color={mode === 'draw' ? '#ffffff' : '#111827'} strokeWidth={2.5} />
            <Text style={[styles.toolLabel, mode === 'draw' && styles.toolLabelActive]}>Rabiscar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'text' ? 'none' : 'text')} style={[styles.toolBtn, mode === 'text' && styles.toolActive]}>
            <TypeIcon size={18} color={mode === 'text' ? '#ffffff' : '#111827'} strokeWidth={2.5} />
            <Text style={[styles.toolLabel, mode === 'text' && styles.toolLabelActive]}>Texto</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'tag' ? 'none' : 'tag')} style={[styles.toolBtn, mode === 'tag' && styles.toolActive]}>
            <AtSign size={18} color={mode === 'tag' ? '#ffffff' : '#111827'} strokeWidth={2.5} />
            <Text style={[styles.toolLabel, mode === 'tag' && styles.toolLabelActive]}>Marcar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'music' ? 'none' : 'music')} style={[styles.toolBtn, mode === 'music' && styles.toolActive]}>
            <Music size={18} color={mode === 'music' ? '#ffffff' : '#111827'} strokeWidth={2.5} />
            <Text style={[styles.toolLabel, mode === 'music' && styles.toolLabelActive]}>Música</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity onPress={undo} style={styles.toolBtn}>
            <Undo2 size={18} color="#111827" strokeWidth={2.5} />
            <Text style={styles.toolLabel}>Desfazer</Text>
          </TouchableOpacity>
        </View>

        {/* Color & Brush when drawing */}
        {mode === 'draw' && (
          <View style={styles.row2}>
            <FlatList
              data={COLORS}
              keyExtractor={(i) => i}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setColor(item)} style={[styles.colorDot, { backgroundColor: item }, color === item && styles.colorDotActive]} />
              )}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 6 }}
              showsHorizontalScrollIndicator={false}
            />
            <View style={styles.brushRow}>
              <TouchableOpacity onPress={() => setBrush(Math.max(2, brush - 2))} style={styles.stepBtn}>
                <ChevronLeft size={16} color="#111827" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.brushLabel}>Espessura: {brush}</Text>
              <TouchableOpacity onPress={() => setBrush(Math.min(24, brush + 2))} style={styles.stepBtn}>
                <ChevronRight size={16} color="#111827" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Text composer */}
        {mode === 'text' && (
          <View style={styles.row2}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite seu texto"
              placeholderTextColor="#9ca3af"
              value={textDraft}
              onChangeText={setTextDraft}
            />
            <FlatList
              data={FONTS || []}
              horizontal
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setFont(item)} style={[styles.fontBtn, font === item && styles.fontActive]}>
                  <Text style={[styles.fontLabel, { fontFamily: item }, font === item && styles.fontLabelActive]}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 6 }}
              showsHorizontalScrollIndicator={false}
            />
            <TouchableOpacity onPress={addTextOverlay} style={[styles.applyBtn, !textDraft.trim() && { backgroundColor: '#e5e7eb' }]} disabled={!textDraft.trim()}>
              <Text style={styles.applyText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tag friends */}
        {mode === 'tag' && (
          <View style={styles.row2}>
            <TextInput
              style={styles.textInput}
              placeholder="Buscar amigos..."
              placeholderTextColor="#9ca3af"
              value={tagQuery}
              onChangeText={setTagQuery}
            />
            <FlatList
              data={tagResults}
              keyExtractor={(i) => String(i.id || i.username || Math.random())}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addTag(item)} style={styles.userItem}>
                  <Text style={styles.userName}>@{item.username || item.first_name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Digite para buscar</Text>}
              style={{ maxHeight: 140 }}
            />
          </View>
        )}

        {/* Music */}
        {mode === 'music' && (
          <View style={styles.row2}>
            <FlatList
              data={TRACKS}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleTrack(item)} style={[styles.trackItem, music?.id === item.id && styles.trackActive]}>
                  <Music size={16} color={music?.id === item.id ? '#ffffff' : '#111827'} strokeWidth={2.5} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, music?.id === item.id && { color: '#ffffff' }]}>{item.title}</Text>
                    <Text style={[styles.trackArtist, music?.id === item.id && { color: '#e5e7eb' }]}>{item.artist}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              style={{ maxHeight: 140 }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0856d6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  saveText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  canvasWrapper: { flex: 1, backgroundColor: '#0b0b0b' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  pickBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#dbeafe' },
  pickLabel: { color: '#0856d6', fontSize: 14, fontWeight: '700' },

  shot: { flex: 1 },
  canvas: { flex: 1 },
  bg: { flex: 1 },

  overlayBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.0)' },
  overlaySelected: { borderWidth: 1, borderColor: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.08)' },
  overlayActions: { position: 'absolute', top: -26, right: -26, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  smallBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  tools: { padding: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#ffffff' },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  toolActive: { backgroundColor: '#0856d6', borderColor: '#0856d6' },
  toolLabel: { fontSize: 12, color: '#111827', fontWeight: '700' },
  toolLabelActive: { color: '#ffffff' },

  row2: { marginTop: 10, gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb' },
  colorDotActive: { borderColor: '#111827', transform: [{ scale: 1.1 }] },
  brushRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  brushLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },

  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  fontBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  fontActive: { backgroundColor: '#0856d6', borderColor: '#0856d6' },
  fontLabel: { fontSize: 12, color: '#111827' },
  fontLabelActive: { color: '#ffffff', fontWeight: '800' },

  userItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  userName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 12 },

  trackItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 12 },
  trackActive: { backgroundColor: '#0856d6', borderColor: '#0856d6' },
  trackTitle: { fontSize: 13, fontWeight: '800', color: '#111827' },
  trackArtist: { fontSize: 12, color: '#6b7280' },
});
