import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image as RNImage,
  Dimensions,
} from 'react-native';
import { Image } from 'react-native';
import { Video } from 'expo-av';
import { X } from 'lucide-react-native';

export type MediaType = 'image' | 'video';

type Props = {
  visible: boolean;
  type: MediaType;
  uri: string;
  onClose: () => void;
};

type ImageDimensions = {
  width: number;
  height: number;
};

export default function MediaViewer({ visible, type, uri, onClose }: Props) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  useEffect(() => {
    if (!visible || type !== 'image' || !uri) return;

    RNImage.getSize(
      uri,
      (width, height) => {
        setImageDimensions({ width, height });
      },
      () => {
        setImageDimensions(null);
      }
    );
  }, [visible, type, uri]);

  const getImageStyle = () => {
    if (!imageDimensions) {
      return styles.media;
    }

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const aspectRatio = imageDimensions.width / imageDimensions.height;

    let width = screenWidth;
    let height = screenHeight;

    // Calcular dimensões mantendo aspect ratio
    if (aspectRatio > screenWidth / screenHeight) {
      // Imagem mais larga proporcionalmente
      height = screenWidth / aspectRatio;
    } else {
      // Imagem mais alta proporcionalmente
      width = screenHeight * aspectRatio;
    }

    // Limitar a 90% da tela
    width = Math.min(width, screenWidth * 0.9);
    height = Math.min(height, screenHeight * 0.9);

    return {
      width,
      height,
      resizeMode: 'contain' as const,
    };
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.mediaContainer}>
          {type === 'image' ? (
            <Image
              source={{ uri }}
              style={getImageStyle()}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={{ uri }}
              style={getImageStyle()}
              resizeMode={Platform.OS === 'web' ? ('contain' as any) : undefined}
              shouldPlay
              useNativeControls
              isLooping
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
});
