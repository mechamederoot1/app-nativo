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
import {
  BarChart3,
  CalendarDays,
  Image as ImageIcon,
  Mic,
  X,
} from 'lucide-react-native';

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
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>V</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={openModal}
            style={styles.inputPill}
          >
            <Text style={styles.pillText}>No que você está pensando?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.hintText}>
            Compartilhe fotos, vídeos ou histórias com a comunidade.
          </Text>
          <TouchableOpacity
            onPress={openModal}
            activeOpacity={0.85}
            style={styles.composeButton}
          >
            <Text style={styles.composeButtonText}>Criar</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  <X size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                Compartilhe seu momento com a comunidade.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Escreva sua mensagem aqui..."
                placeholderTextColor="#9aa0a6"
                multiline
                value={text}
                onChangeText={setText}
              />

              <View style={styles.modalActionsRow}>
                {POST_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.modalAction}
                    activeOpacity={0.9}
                  >
                    <View style={styles.modalActionIcon}>
                      <action.Icon size={18} color="#0856d6" />
                    </View>
                    <Text style={styles.modalActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePublish}
                  style={[
                    styles.publishButton,
                    !canPublish && styles.publishButtonDisabled,
                  ]}
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
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e0ecff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: '#0856d6',
    fontSize: 18,
    fontWeight: '700',
  },
  inputPill: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillText: {
    color: '#6b7280',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  hintText: {
    color: '#64748b',
    fontSize: 12,
    flex: 1,
    marginRight: 10,
  },
  composeButton: {
    backgroundColor: '#0856d6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  composeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
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
