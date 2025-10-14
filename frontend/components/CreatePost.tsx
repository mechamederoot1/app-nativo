import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { BarChart3, CalendarDays, Image as ImageIcon, Mic, X } from 'lucide-react-native';

type CreatePostProps = {
  onCreate: (content: string) => void;
};

type ActionItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const POST_ACTIONS: ActionItem[] = [
  { id: 'media', label: 'Fotos & Vídeos', Icon: ImageIcon },
  { id: 'audio', label: 'Áudio', Icon: Mic },
  { id: 'poll', label: 'Enquete', Icon: BarChart3 },
  { id: 'event', label: 'Acontecimento', Icon: CalendarDays },
];

export default function CreatePost({ onCreate }: CreatePostProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setText('');
  }, []);

  const handlePublish = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onCreate(trimmed);
    closeModal();
  }, [closeModal, onCreate, text]);

  const canPublish = text.trim().length > 0;

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openModal}
          style={styles.promptInput}
        >
          <Text style={styles.promptText}>No que você está pensando?</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Criar publicação</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <X size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Compartilhe seu momento com a comunidade.</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Escreva sua mensagem aqui..."
                placeholderTextColor="#9aa0a6"
                multiline
                value={text}
                onChangeText={setText}
              />

              <View style={styles.modalActionsRow}>
                {POST_ACTIONS.map(action => (
                  <TouchableOpacity key={action.id} style={styles.modalAction} activeOpacity={0.9}>
                    <View style={styles.modalActionIcon}>
                      <action.Icon size={18} color="#0856d6" />
                    </View>
                    <Text style={styles.modalActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePublish}
                  style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
                  disabled={!canPublish}
                >
                  <Text style={styles.publishText}>Publicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 20,
  },
  promptInput: {
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  promptText: {
    color: '#6b7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 520,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 16,
  },
  modalInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#dbe1ec',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f8faff',
  },
  modalActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  modalAction: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#dbe1ec',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    marginBottom: 12,
  },
  modalActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e0ecff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  publishButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#0856d6',
  },
  publishButtonDisabled: {
    backgroundColor: '#9cbcf2',
  },
  publishText: {
    color: '#fff',
    fontWeight: '700',
  },
});
