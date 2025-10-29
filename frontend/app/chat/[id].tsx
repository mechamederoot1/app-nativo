import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Send,
  Plus,
  Smile,
  Mic,
  X,
} from 'lucide-react-native';
import { api } from '../../utils/api';
import { getSocket, onNotification, offNotification, NotificationEvents } from '../../utils/websocket';

const getDimensions = () => {
  if (Platform.OS === 'web') {
    return { width: typeof window !== 'undefined' ? window.innerWidth : 375 };
  }
  return Dimensions.get('window');
};
const { width } = getDimensions();

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_photo?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  content: string;
  content_type: 'text' | 'image' | 'audio' | 'gif';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender: User;
}

interface Conversation {
  id: number;
  name?: string;
  is_group: boolean;
  participants: User[];
  created_at: string;
  updated_at: string;
}

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  const messageTime = new Date(message.created_at);
  const timeStr = messageTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.messageBubbleContainer, isOwn && styles.messageBubbleContainerOwn]}>
      {!isOwn && (
        <Image
          source={{ uri: message.sender.profile_photo || `https://i.pravatar.cc/150?u=${message.sender.id}` }}
          style={styles.messageSenderAvatar}
        />
      )}

      <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
        {message.content_type === 'text' && (
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {message.content}
          </Text>
        )}

        {message.content_type === 'image' && message.media_url && (
          <Image
            source={{ uri: message.media_url }}
            style={styles.messageImage}
            onError={(e) => console.log('Image load error:', e)}
          />
        )}

        {message.content_type === 'audio' && (
          <View style={styles.audioMessageContainer}>
            <Mic size={20} color={isOwn ? '#fff' : '#3b82f6'} />
            <Text style={[styles.audioLabel, isOwn && styles.audioLabelOwn]}>
              {message.content}
            </Text>
          </View>
        )}

        {message.content_type === 'gif' && message.media_url && (
          <Image
            source={{ uri: message.media_url }}
            style={styles.messageGif}
            onError={(e) => console.log('GIF load error:', e)}
          />
        )}

        <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
          {timeStr}
        </Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);
  const socket = getSocket();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user
  useEffect(() => {
    const user = api.getCurrentUser?.();
    if (user) {
      setCurrentUserId(user.id);
    }
  }, []);

  // Load conversation and messages
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/chat/conversations/${id}/messages`);
        
        // Create a mock conversation object (in production this would come from API)
        setConversation({
          id: parseInt(id as string),
          is_group: false,
          participants: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        setMessages(response);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadConversation();
    }
  }, [id]);

  // Setup websocket listeners
  useEffect(() => {
    if (!socket) return;

    const unsubscribeMessage = onNotification('chat_message', (data: Message) => {
      if (data.conversation_id === parseInt(id as string)) {
        setMessages(prev => [...prev, data]);
      }
    });

    const unsubscribeTyping = onNotification('typing_start', (data) => {
      if (data.conversation_id === parseInt(id as string)) {
        setTypingUsers(prev => [...prev, data.user]);
      }
    });

    const unsubscribeTypingStop = onNotification('typing_stop', (data) => {
      if (data.conversation_id === parseInt(id as string)) {
        setTypingUsers(prev => prev.filter(u => u.id !== data.user.id));
      }
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
      unsubscribeTypingStop?.();
    };
  }, [socket, id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !socket || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        conversation_id: parseInt(id as string),
        content: inputText,
        content_type: 'text',
      };

      socket.emit('chat_message', messageData);
      setInputText('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);

    if (!socket) return;

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket.emit('typing', {
        conversation_id: parseInt(id as string),
        typing: true,
      });
    } else if (isTyping && text.length === 0) {
      setIsTyping(false);
      socket.emit('typing', {
        conversation_id: parseInt(id as string),
        typing: false,
      });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit('typing', {
          conversation_id: parseInt(id as string),
          typing: false,
        });
      }
    }, 3000);
  };

  const handleAddMedia = async (type: 'image' | 'audio' | 'gif') => {
    // TODO: Implementar seleção de mídia
    console.log('Add media:', type);
  };

  const getConversationTitle = useMemo(() => {
    if (!conversation) return 'Carregando...';
    if (conversation.name) return conversation.name;
    
    const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
    if (otherParticipants.length === 1) {
      return `${otherParticipants[0].first_name} ${otherParticipants[0].last_name}`;
    }
    
    return `${otherParticipants.length} participantes`;
  }, [conversation, currentUserId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#0f172a" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{getConversationTitle}</Text>
            {conversation?.is_group && (
              <Text style={styles.headerSubtitle}>
                {conversation.participants.length} participantes
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity activeOpacity={0.7}>
              <Smile size={24} color="#0f172a" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.sender.id === currentUserId}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma mensagem ainda</Text>
              <Text style={styles.emptySubtext}>Comece uma conversa!</Text>
            </View>
          }
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUsers.map(u => u.first_name).join(', ')} {'está digitando...'}
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => handleAddMedia('image')}
              style={styles.mediaButton}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#3b82f6" strokeWidth={2} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />

            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                onPress={handleSendMessage}
                style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                activeOpacity={0.7}
                disabled={isSending}
              >
                <Send size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleAddMedia('audio')}
                style={styles.micButton}
                activeOpacity={0.7}
              >
                <Mic size={20} color="#3b82f6" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  headerActions: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    gap: 8,
  },
  messageBubbleContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageSenderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubbleOwn: {
    backgroundColor: '#3b82f6',
  },
  messageText: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageGif: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  audioMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  audioLabel: {
    fontSize: 13,
    color: '#0f172a',
  },
  audioLabelOwn: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  messageTimeOwn: {
    color: '#e0f2fe',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  mediaButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
