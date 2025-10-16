import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
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

export default function MediaViewer({ visible, type, uri, onClose }: Props) {
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

        {type === 'image' ? (
          <Image source={{ uri }} style={styles.media} resizeMode="contain" />
        ) : (
          <Video
            source={{ uri }}
            style={styles.media}
            resizeMode={Platform.OS === 'web' ? ('contain' as any) : undefined}
            shouldPlay
            useNativeControls
            isLooping
          />
        )}
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
