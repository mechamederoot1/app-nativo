import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { Download, X, RotateCcw } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ProfilePhotoEditorProps {
  imageUri: string;
  isVisible: boolean;
  onSave: (imageUri: string, caption: string) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 280;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

export default function ProfilePhotoEditor({
  imageUri,
  isVisible,
  onSave,
  onCancel,
}: ProfilePhotoEditorProps) {
  const [caption, setCaption] = useState('');
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Shared values for gesture animations
  const scale$ = useSharedValue(1);
  const offsetX$ = useSharedValue(0);
  const offsetY$ = useSharedValue(0);

  const lastScale = useRef(1);
  const lastOffsetX = useRef(0);
  const lastOffsetY = useRef(0);

  // Pinch gesture
  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, lastScale.current * event.scale),
      );
      scale$.value = newScale;
      setScale(newScale);
    })
    .onEnd(() => {
      lastScale.current = scale$.value;
    });

  // Pan gesture (only when zoomed)
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (scale$.value > MIN_SCALE) {
        const maxOffset = (CIRCLE_SIZE * (scale$.value - 1)) / 2;

        const newOffsetX = Math.max(
          -maxOffset,
          Math.min(maxOffset, lastOffsetX.current + event.translationX),
        );
        const newOffsetY = Math.max(
          -maxOffset,
          Math.min(maxOffset, lastOffsetY.current + event.translationY),
        );

        offsetX$.value = newOffsetX;
        offsetY$.value = newOffsetY;
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
      }
    })
    .onEnd(() => {
      lastOffsetX.current = offsetX$.value;
      lastOffsetY.current = offsetY$.value;
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale$.value },
      { translateX: offsetX$.value },
      { translateY: offsetY$.value },
    ],
  }));

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    scale$.value = 1;
    offsetX$.value = 0;
    offsetY$.value = 0;
    lastScale.current = 1;
    lastOffsetX.current = 0;
    lastOffsetY.current = 0;
  };

  const handleSave = () => {
    onSave(imageUri, caption);
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <X size={24} color="#0f172a" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Foto</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <Download size={24} color="#0f172a" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {/* Editor Canvas */}
          <View style={styles.editorSection}>
            <Text style={styles.sectionLabel}>Editar Foto</Text>
            <Text style={styles.instructionHint}>
              Arraste com um dedo ou faça pinch com dois dedos
            </Text>

            <GestureDetector gesture={composedGesture}>
              <View style={styles.circleContainer}>
                {/* Background container for circular crop */}
                <View style={styles.circleMask}>
                  <Animated.Image
                    source={{ uri: imageUri }}
                    style={[styles.image, animatedStyle]}
                  />
                </View>

                {/* Circular border indicator */}
                <View style={styles.circleBorderIndicator} />

                {/* Zoom level display */}
                <View style={styles.zoomDisplay}>
                  <Text style={styles.zoomDisplayText}>
                    {Math.round(scale * 100)}%
                  </Text>
                </View>
              </View>
            </GestureDetector>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              activeOpacity={0.7}
            >
              <RotateCcw size={16} color="#64748b" strokeWidth={2.5} />
              <Text style={styles.resetBtnText}>Resetar</Text>
            </TouchableOpacity>
          </View>

          {/* Caption Section */}
          <View style={styles.captionSection}>
            <Text style={styles.sectionLabel}>Legenda (Opcional)</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Adicione uma legenda para sua foto..."
              placeholderTextColor="#94a3b8"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={150}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{caption.length}/150</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Como usar:</Text>
            <Text style={styles.instructionText}>
              • Arraste com um dedo para posicionar (funciona quando ampliado)
            </Text>
            <Text style={styles.instructionText}>
              • Coloque dois dedos e afaste ou aproxime para fazer zoom
            </Text>
            <Text style={styles.instructionText}>
              • Use "Resetar" para voltar ao padrão
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.cancelBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Salvar Foto</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  editorSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  instructionHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontStyle: 'italic',
  },
  circleContainer: {
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  circleMask: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  image: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  circleBorderIndicator: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 3,
    borderColor: '#3b82f6',
    pointerEvents: 'none',
  },
  zoomDisplay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    pointerEvents: 'none',
  },
  zoomDisplayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  captionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
    maxHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  instructionsSection: {
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
