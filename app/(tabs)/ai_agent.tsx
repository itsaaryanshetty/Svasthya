import React, { useState } from 'react';
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

const BACKEND_URL =
  process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL ?? 'http://localhost:8000/chat';

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
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Backend request failed');
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
      setError(e?.message ?? 'Something went wrong.');
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
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
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