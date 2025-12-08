// app/(tabs)/audio.tsx
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Backend base URL where FastAPI is reachable from the *device*.
 * 
 * IMPORTANT: Replace this with your computer's IP address!
 * Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
 */

// 🔥 CHANGE THIS to your computer's IP address
const YOUR_COMPUTER_IP = "192.168.1.7"; // ← Change this if needed

const RAW_BACKEND_BASE = process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL;

// Use your computer's IP for Android, localhost for web/iOS
const FALLBACK_BASE =
  Platform.OS === "android" 
    ? `http://${YOUR_COMPUTER_IP}:8001`
    : "http://localhost:8001";

const BACKEND_BASE = RAW_BACKEND_BASE || FALLBACK_BASE;

console.log("🌐 Using backend URL:", BACKEND_BASE);

export default function AudioPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const updateStatus = (message: string) => {
    console.log(`[STATUS] ${message}`);
    setStatusMessage(message);
  };

  const pickAndUpload = async () => {
    try {
      updateStatus("Opening file picker...");
      
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.length) {
        updateStatus("File selection cancelled");
        return;
      }

      const asset = res.assets[0];
      const { uri: pickedUri, name, mimeType } = asset;
      
      console.log("===== FILE PICKED =====");
      console.log("URI:", pickedUri);
      console.log("Name:", name);
      console.log("MIME:", mimeType);
      console.log("Full asset:", asset);
      console.log("=======================");

      setLoading(true);
      setSummary(null);
      setTranscriptPreview(null);
      
      updateStatus(`Selected: ${name}`);

      // Step 1: Prepare the file for upload
      updateStatus("Preparing file for upload...");
      
      const formData = new FormData();
      
      // Determine file extension and MIME type
      const ext = name?.split(".").pop()?.toLowerCase() || "wav";
      const inferredMimeType = mimeType || `audio/${ext === "m4a" ? "mp4" : ext}`;
      
      console.log("Inferred MIME type:", inferredMimeType);

      if (Platform.OS === "web") {
        updateStatus("Fetching file blob (web)...");
        try {
          const response = await fetch(pickedUri);
          const blob = await response.blob();
          console.log("Blob created:", blob.size, "bytes, type:", blob.type);
          // @ts-ignore - FormData accepts Blob on web
          formData.append("file", blob, name || "audio.wav");
        } catch (err) {
          console.error("Web blob creation failed:", err);
          throw new Error(`Failed to prepare file: ${err}`);
        }
      } else {
        // React Native: use URI-based file object
        updateStatus("Preparing file (mobile)...");
        
        // Ensure proper URI format
        let finalUri = pickedUri;
        if (!pickedUri.startsWith("file://") && !pickedUri.startsWith("content://")) {
          finalUri = "file://" + pickedUri;
        }
        
        console.log("Final URI for upload:", finalUri);
        
        formData.append("file", {
          uri: finalUri,
          name: name || "audio.wav",
          type: inferredMimeType,
        } as any);
      }

      // Step 2: Test backend connection first
      updateStatus("Testing backend connection...");
      const healthUrl = `${BACKEND_BASE}/health`;
      console.log("Testing connection to:", healthUrl);
      
      try {
        const healthResp = await fetch(healthUrl, { 
          method: "GET",
          headers: { "Accept": "application/json" }
        });
        const healthText = await healthResp.text();
        console.log("Health check response:", healthResp.status, healthText);
        
        if (!healthResp.ok) {
          throw new Error(
            `Backend not responding correctly.\n` +
            `Status: ${healthResp.status}\n` +
            `Make sure backend is running:\n` +
            `python ai_part/transcribe_summarize_api.py`
          );
        }
        
        const healthData = JSON.parse(healthText);
        console.log("Backend health:", healthData);
        
        if (!healthData.whisper_available) {
          throw new Error("Whisper is not installed on backend. Run: pip install openai-whisper");
        }
        if (!healthData.gemini_api_key_set) {
          throw new Error("Gemini API key not configured in backend .env file");
        }
        
        updateStatus("Backend connected! ✓");
      } catch (healthErr: any) {
        console.error("Health check failed:", healthErr);
        throw new Error(
          `Cannot connect to backend at ${BACKEND_BASE}\n\n` +
          `Error: ${healthErr.message}\n\n` +
          `Make sure:\n` +
          `1. Backend is running: python ai_part/transcribe_summarize_api.py\n` +
          `2. You see "Uvicorn running on http://0.0.0.0:8001"\n` +
          `3. Test in browser: http://localhost:8001/health`
        );
      }
      
      // Step 3: Upload to backend
      const uploadUrl = `${BACKEND_BASE}/transcribe_summarize`;
      console.log("===== UPLOADING =====");
      console.log("URL:", uploadUrl);
      console.log("=====================");
      
      updateStatus("Uploading to server...");

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        updateStatus("Request timed out!");
      }, 180000); // 3 minute timeout

      let resp;
      try {
        resp = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            // Don't set Content-Type - let the browser/RN set it with boundary
          },
        });
        clearTimeout(timeoutId);
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.error("Fetch error:", fetchErr);
        
        if (fetchErr.name === "AbortError") {
          throw new Error("Request timed out after 3 minutes");
        }
        throw new Error(
          `Network error: ${fetchErr.message}\n\n` +
          `Backend might not be running. Check terminal for:\n` +
          `"Uvicorn running on http://0.0.0.0:8001"`
        );
      }

      updateStatus("Reading server response...");
      
      const text = await resp.text();
      console.log("===== SERVER RESPONSE =====");
      console.log("Status:", resp.status);
      console.log("Response text:", text.substring(0, 500));
      console.log("===========================");

      if (!resp.ok) {
        // Server error
        console.error("Server returned error:", resp.status, text);
        throw new Error(`Server error (${resp.status}): ${text.substring(0, 200)}`);
      }

      // Step 3: Parse response
      updateStatus("Processing results...");
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        console.error("Raw text:", text);
        throw new Error("Server returned invalid JSON. Check server logs.");
      }

      console.log("Parsed response:", {
        hasTranscript: !!data.transcript,
        hasSummary: !!data.summary,
        transcriptLength: data.transcript?.length,
      });

      // Step 4: Display results
      updateStatus("Done! ✓");
      
      const transcript = data.transcript || "";
      const summaryText = data.summary || "No summary returned.";
      
      setTranscriptPreview(transcript.slice(0, 3000));
      setSummary(summaryText);
      
      // Show success alert
      Alert.alert(
        "Success! 🎉",
        "Your audio has been transcribed and summarized.",
        [{ text: "OK" }]
      );
      
    } catch (e: any) {
      console.error("===== ERROR =====");
      console.error(e);
      console.error("=================");
      
      const errorMsg = e?.message || String(e);
      updateStatus(`Error: ${errorMsg}`);
      
      Alert.alert(
        "Upload Error",
        errorMsg + "\n\nCheck console for details.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Audio → Transcribe & Summarize</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={pickAndUpload}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "📁 Pick Audio File"}
          </Text>
        </TouchableOpacity>

        {/* Status indicator */}
        {statusMessage ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>
              This may take 1-2 minutes...
            </Text>
          </View>
        )}

        {/* Transcript preview */}
        {transcriptPreview ? (
          <View style={styles.box}>
            <Text style={styles.label}>📝 Transcript Preview:</Text>
            <ScrollView style={styles.scrollContent} nestedScrollEnabled>
              <Text style={styles.smallText}>
                {transcriptPreview}
                {transcriptPreview.length >= 3000 ? "\n\n..." : ""}
              </Text>
            </ScrollView>
          </View>
        ) : null}

        {/* Summary */}
        {summary ? (
          <View style={styles.box}>
            <Text style={styles.label}>✨ Summary:</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: "#4B5563",
  },
  buttonText: {
    color: "#0B1120",
    fontWeight: "700",
    fontSize: 16,
  },
  statusBox: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  statusText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingBox: {
    marginTop: 24,
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 14,
  },
  box: {
    marginTop: 20,
    backgroundColor: "#0F1724",
    padding: 16,
    borderRadius: 12,
    maxHeight: 400,
  },
  label: {
    color: "#CBD5F5",
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 16,
  },
  scrollContent: {
    maxHeight: 300,
  },
  smallText: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryText: {
    color: "#E5E7EB",
    fontSize: 16,
    lineHeight: 24,
  },
});