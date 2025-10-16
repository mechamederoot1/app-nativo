import React, { useState, useRef, useCallback } from 'react';
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
  GestureResponderEvent,
  PanResponder,
} from 'react-native';
import {
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react-native';

interface ProfilePhotoEditorProps {
  imageUri: string;
  isVisible: boolean;
  onSave: (imageUri: string, caption: string) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 280;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

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
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [initialOffsetX, setInitialOffsetX] = useState(0);
  const [initialOffsetY, setInitialOffsetY] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          setInitialDistance(distance);
          setInitialScale(scale);
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          // Two finger pinch
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (initialDistance > 0) {
            const scaleFactor = distance / initialDistance;
            const newScale = Math.max(1, Math.min(3, initialScale * scaleFactor));
            setScale(newScale);
          }
        } else if (touches.length === 1) {
          // Single finger pan - only pan if zoomed in
          if (scale > 1) {
            const maxOffset = (CIRCLE_SIZE * (scale - 1)) / 2;
            const newOffsetX = Math.max(
              -maxOffset,
              Math.min(maxOffset, initialOffsetX + evt.nativeEvent.dx),
            );
            const newOffsetY = Math.max(
              -maxOffset,
              Math.min(maxOffset, initialOffsetY + evt.nativeEvent.dy),
            );
            setOffsetX(newOffsetX);
            setOffsetY(newOffsetY);
          }
        }
      },
      onPanResponderRelease: () => {
        setInitialDistance(0);
        setInitialOffsetX(offsetX);
        setInitialOffsetY(offsetY);
      },
      onPanResponderTerminate: () => {
        setInitialDistance(0);
      },
    }),
  ).current;

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setInitialOffsetX(0);
    setInitialOffsetY(0);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(1, prev - 0.2));
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
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerBtn}
            disabled={!caption.trim()}
          >
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

            <View style={styles.circleContainer} {...panResponder.panHandlers}>
              {/* Background container for circular crop */}
              <View style={styles.circleMask}>
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.image,
                    {
                      transform: [
                        { scale },
                        { translateX: offsetX },
                        { translateY: offsetY },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Circular border indicator */}
              <View style={styles.circleBorderIndicator} />
            </View>

            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                onPress={handleZoomOut}
                style={styles.zoomBtn}
                activeOpacity={0.7}
              >
                <ZoomOut size={20} color="#3b82f6" strokeWidth={2.5} />
                <Text style={styles.zoomLabel}>Diminuir</Text>
              </TouchableOpacity>

              <View style={styles.zoomValue}>
                <Text style={styles.zoomValueText}>
                  {Math.round(scale * 100)}%
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleZoomIn}
                style={styles.zoomBtn}
                activeOpacity={0.7}
              >
                <ZoomIn size={20} color="#3b82f6" strokeWidth={2.5} />
                <Text style={styles.zoomLabel}>Aumentar</Text>
              </TouchableOpacity>
            </View>

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
            <Text style={styles.instructionsTitle}>Dicas:</Text>
            <Text style={styles.instructionText}>
              • Arraste para posicionar a imagem
            </Text>
            <Text style={styles.instructionText}>
              • Use dois dedos para fazer zoom
            </Text>
            <Text style={styles.instructionText}>
              • Clique em "Aumentar" e "Diminuir" para ajustar o zoom
            </Text>
            <Text style={styles.instructionText}>
              • A foto será salva em formato circular
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
            style={[
              styles.saveBtn,
              !caption.trim() && styles.saveBtnDisabled,
            ]}
            activeOpacity={0.8}
            disabled={!caption.trim()}
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
    marginBottom: 16,
    alignSelf: 'flex-start',
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
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    alignSelf: 'center',
  },
  zoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  zoomLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  zoomValue: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  zoomValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
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
  saveBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
