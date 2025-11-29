// app/(tabs)/audio.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Backend base URL where FastAPI is reachable from the *device*.
 *
 * - If EXPO_PUBLIC_CHATBOT_BACKEND_URL is set and uses 0.0.0.0 (server bind),
 *   we automatically rewrite it to something the client can reach:
 *   - Android emulator → 10.0.2.2
 *   - iOS / web → localhost
 * - Otherwise we fall back to:
 *   - Android emulator: http://10.0.2.2:8000
 *   - iOS / web: http://localhost:8000
 */
const RAW_BACKEND_BASE = process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL;

const FALLBACK_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

const BACKEND_BASE =
  RAW_BACKEND_BASE && RAW_BACKEND_BASE.includes("0.0.0.0")
    ? RAW_BACKEND_BASE.replace(
        "0.0.0.0",
        Platform.OS === "android" ? "10.0.2.2" : "localhost"
      )
    : RAW_BACKEND_BASE || FALLBACK_BASE;

export default function AudioPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);

  const pickAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.length) return;

      const asset = res.assets[0];
      const { uri: pickedUri, name, mimeType } = asset;
      
      console.log("Picked file:", { pickedUri, name, res });

      setLoading(true);
      setSummary(null);
      setTranscriptPreview(null);

      const formData = new FormData();

      // ALWAYS try to get a Blob for the file. On web we must fetch() the object URL; on native fetch(uri) often works.
      // But on Android content:// URIs fetch may fail; we attempt fetch first then fallback to using the cached file URI with 'file://' prefix.
      let fileForForm: any = null;
      try {
        // Normalize URI for native: ensure file:// prefix for some Android URIs
        let normalizedUri = pickedUri;
        if (Platform.OS !== "web" && !normalizedUri.startsWith("file://") && !normalizedUri.startsWith("content://")) {
          normalizedUri = "file://" + normalizedUri;
        }

        // try fetch -> blob (works on web and often on native)
        const fetched = await fetch(normalizedUri);
        const blob = await fetched.blob();
        const guessedExt = name?.split(".").pop() ?? "wav";
        const mime =
          blob.type || mimeType || `audio/${guessedExt === "m4a" ? "mpeg" : guessedExt}`;
        // Attach blob (web)
        fileForForm = { blob, filename: name ?? "audio.wav", mime };
      } catch (errFetch) {
        console.warn("fetch to blob failed, will fallback to native file upload method:", errFetch);
      }

      if (fileForForm) {
        // For web: append blob directly; for native we'll convert the blob to File in web env, but RN FormData can accept blob on web.
        if (Platform.OS === "web") {
          // @ts-ignore
          formData.append("file", fileForForm.blob, fileForForm.filename);
        } else {
          // on native: convert blob -> File not available; instead use uri object approach
          // fallback: append local file object (uri, name, type) which fetch on server side will accept
          const ext = (name && name.split(".").pop()) || "wav";
          const inferredType =
            fileForForm.mime || mimeType || `audio/${ext === "m4a" ? "mpeg" : ext}`;
          formData.append("file", {
            uri: pickedUri.startsWith("file://") || pickedUri.startsWith("content://") ? pickedUri : "file://" + pickedUri,
            name: name ?? "audio.wav",
            type: inferredType,
          } as any);
        }
      } else {
        // Last-resort fallback: native file object (uri,name,type)
        const ext = (name && name.split(".").pop()) || "wav";
        const inferredType = mimeType || `audio/${ext === "m4a" ? "mpeg" : ext}`;
        formData.append("file", {
          uri: pickedUri.startsWith("file://") || pickedUri.startsWith("content://") ? pickedUri : "file://" + pickedUri,
          name: name ?? "audio.wav",
          type: inferredType,
        } as any);
      }

      console.log("Uploading to", `${BACKEND_BASE}/transcribe_summarize`);
      const resp = await fetch(`${BACKEND_BASE}/transcribe_summarize`, {
        method: "POST",
        body: formData,
      });

      const text = await resp.text();
      console.log("Raw response text:", text);

      if (!resp.ok) {
        // server error or bad request: show details
        Alert.alert("Upload failed", text || `Status ${resp.status}`);
        setLoading(false);
        return;
      }

      // parse JSON safely
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Response parse error", "Server returned non-JSON response. See console.");
        setLoading(false);
        console.error("Parse error", e, text);
        return;
      }

      console.log("Response JSON:", data);
      setTranscriptPreview((data.transcript ?? "").slice(0, 3000));
      setSummary(data.summary ?? "No summary returned.");
    } catch (e: any) {
      console.error("Upload error:", e);
      Alert.alert("Upload error", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Audio → Transcribe & Summarize</Text>

        <TouchableOpacity style={styles.button} onPress={pickAndUpload} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Processing..." : "Pick audio file"}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator style={{ marginTop: 12 }} size="large" />}

        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {transcriptPreview ? (
            <View style={styles.box}>
              <Text style={styles.label}>Transcript:</Text>
              <Text style={styles.smallText}>
                {transcriptPreview}
                {transcriptPreview.length >= 3000 ? "..." : ""}
              </Text>
            </View>
          ) : null}

          {summary ? (
            <View style={styles.box}>
              <Text style={styles.label}>Summary:</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0B1120" },
  container: { padding: 16, flex: 1 },
  title: { color: "#E5E7EB", fontSize: 20, fontWeight: "700", marginBottom: 16 },
  button: { backgroundColor: "#22C55E", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#0B1120", fontWeight: "700" },
  box: { marginTop: 18, backgroundColor: "#0F1724", padding: 12, borderRadius: 8 },
  label: { color: "#CBD5F5", fontWeight: "600", marginBottom: 6 },
  smallText: { color: "#E5E7EB" },
  summaryText: { color: "#E5E7EB", fontSize: 16 },
});
