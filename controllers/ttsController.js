// controllers/ttsController.js — Synthèse vocale : ElevenLabs (timeout 7s) → Gemini TTS → silence

function cleanText(text) {
  return (text || "")
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[⬡✅📐🔢💡➡🎯🦉━═📌📖•·]/g, "")
    .replace(/\*+|#+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);
}

async function elevenLabsTTS(text, timeoutMs = 4000) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${errText}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString("base64");
  } finally {
    clearTimeout(timer);
  }
}

const GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";

// Gemini renvoie du PCM 16 bits brut : on ajoute un en-tête WAV pour que le navigateur le lise.
function pcmToWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function geminiTTS(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Pas de clé Gemini");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `Lis ce texte en français avec une voix pédagogique et bienveillante : "${text}"` }] },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const parsed = await res.json();
  if (parsed.error) throw new Error(parsed.error.message);
  const inline = parsed.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) throw new Error("Pas d'audio Gemini");

  const rate = Number(/rate=(\d+)/i.exec(inline.mimeType || "")?.[1]) || 24000;
  const wav = pcmToWav(Buffer.from(inline.data, "base64"), rate);
  return { audio: wav.toString("base64"), mime: "audio/wav" };
}

async function synthesize(req, res) {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text requis." });

  const clean = cleanText(text);
  if (!clean) return res.json({ silent: true });

  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const audio = await elevenLabsTTS(clean, 7000);
      return res.json({ audioContent: audio, mimeType: "audio/mpeg", source: "elevenlabs" });
    } catch (err) {
      console.warn("[tts] ElevenLabs:", err.message);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const { audio, mime } = await geminiTTS(clean);
      return res.json({ audioContent: audio, mimeType: mime, source: "gemini" });
    } catch (err) {
      console.warn("[tts] Gemini:", err.message);
    }
  }

  return res.json({ silent: true, source: "none" });
}

module.exports = { synthesize };
