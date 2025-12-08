import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Handle URL for different platforms (Android emulator needs 10.0.2.2)
const RAW_BACKEND_URL = process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL;
const FALLBACK_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

let BACKEND_BASE = FALLBACK_BASE;
if (RAW_BACKEND_URL) {
  if (RAW_BACKEND_URL.includes('0.0.0.0')) {
    BACKEND_BASE = RAW_BACKEND_URL.replace(
      '0.0.0.0',
      Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
    );
  } else {
    // Remove /chat if present, we'll add it back
    BACKEND_BASE = RAW_BACKEND_URL.replace('/chat', '').replace('/chat/', '');
  }
}

const BACKEND_URL = `${BACKEND_BASE}/chat`;

type ChatBubble = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

const ai_agent = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMsg: ChatBubble = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log('Sending request to:', BACKEND_URL);
      
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', text: trimmed }],
          system_prompt:
            'You are a helpful AI medical assistant which provides details about the diseases, symptoms, and treatments for the diseases. Be concise and friendly.',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = text || `Backend request failed with status ${res.status}`;
        try {
          const errorJson = JSON.parse(text);
          errorMsg = errorJson.detail || errorJson.message || errorMsg;
        } catch {
          // Not JSON, use text as is
        }
        throw new Error(errorMsg);
      }

      const data = (await res.json()) as { reply?: string };
      const replyText = data.reply ?? 'No reply from server.';
      const botMsg: ChatBubble = {
        id: `bot-${Date.now()}`,
        from: 'bot',
        text: replyText,
      };
      setMessages((prev) => [...prev, botMsg]);
      setUserInput('');
    } catch (e: any) {
      console.error('Chat error:', e);
      if (e.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (e.message?.includes('Network request failed') || e.message?.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 8000.');
      } else {
        setError(e?.message ?? 'Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.container}>
          <Text style={styles.title}>General Chatbot</Text>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !error && (
              <Text style={styles.placeholderText}>
                Start the conversation by typing a message below.
              </Text>
            )}

            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubble,
                  m.from === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={
                    m.from === 'user' ? styles.userBubbleText : styles.botBubbleText
                  }
                >
                  {m.text}
                </Text>
              </View>
            ))}

            {error && (
              <View style={[styles.bubble, styles.botBubble]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              value={userInput}
              onChangeText={setUserInput}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || !userInput.trim()) && styles.buttonDisabled,
              ]}
              onPress={sendMessage}
              disabled={isLoading || !userInput.trim()}
            >
              <Text style={styles.buttonText}>
                {isLoading ? '...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ai_agent;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#E5E7EB',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
    gap: 8,
  },
  placeholderText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 2,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    color: '#F9FAFB',
  },
  button: {
    marginLeft: 8,
    marginBottom: 10,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
  },
  buttonDisabled: {
    backgroundColor: '#4B5563',
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#22C55E',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
  },
  userBubbleText: {
    color: '#F9FAFB',
  },
  botBubbleText: {
    color: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 6,
  },
  errorText: {
    color: '#F97373',
  },
});