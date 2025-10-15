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

const modalTheme = {
  overlay: 'rgba(15,23,42,0.45)',
  card: '#ffffff',
  border: '#d7e1ff',
  soft: '#f5f8ff',
  softer: '#ecf2ff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  primary: '#2563eb',
  primaryMuted: '#9cbcf2',
  avatarBg: '#e5edff',
};

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
                  activeOpacity={0.8}
                >
                  <X size={18} color={modalTheme.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                Compartilhe seu momento com a comunidade.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Escreva sua mensagem aqui..."
                placeholderTextColor={modalTheme.textMuted}
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
                      <action.Icon size={18} color={modalTheme.primary} />
                    </View>
                    <Text style={styles.modalActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.cancelButton}
                  activeOpacity={0.85}
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
                  activeOpacity={0.85}
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
    backgroundColor: modalTheme.card,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: modalTheme.border,
    marginBottom: 12,
    shadowColor: '#1e293b',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modalTheme.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: modalTheme.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  inputPill: {
    flex: 1,
    backgroundColor: modalTheme.soft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: modalTheme.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillText: {
    color: modalTheme.textMuted,
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  hintText: {
    color: modalTheme.textMuted,
    fontSize: 12,
    flex: 1,
    marginRight: 12,
  },
  composeButton: {
    backgroundColor: modalTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  composeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: modalTheme.overlay,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    backgroundColor: modalTheme.card,
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderColor: modalTheme.border,
    shadowColor: '#1e293b',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: modalTheme.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: modalTheme.soft,
    borderWidth: 1,
    borderColor: modalTheme.border,
  },
  modalSubtitle: {
    fontSize: 13,
    color: modalTheme.textMuted,
    marginTop: 10,
    marginBottom: 18,
  },
  modalInput: {
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: modalTheme.border,
    borderRadius: 18,
    padding: 14,
    fontSize: 14,
    color: modalTheme.textPrimary,
    backgroundColor: modalTheme.soft,
  },
  modalActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalAction: {
    width: '48%',
    borderWidth: 1,
    borderColor: modalTheme.border,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modalTheme.soft,
    marginBottom: 14,
  },
  modalActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: modalTheme.softer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: modalTheme.textPrimary,
    flexShrink: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 22,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: modalTheme.soft,
    borderWidth: 1,
    borderColor: modalTheme.border,
    marginRight: 12,
  },
  cancelText: {
    color: modalTheme.textSecondary,
    fontWeight: '600',
  },
  publishButton: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 14,
    backgroundColor: modalTheme.primary,
  },
  publishButtonDisabled: {
    backgroundColor: modalTheme.primaryMuted,
  },
  publishText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
