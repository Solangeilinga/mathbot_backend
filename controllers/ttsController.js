// controllers/ttsController.js — Synthèse vocale : ElevenLabs (timeout 4s) → Gemini TTS → silence

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
        model_id: "eleven_multilingual_v2",
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

async function geminiTTS(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Pas de clé Gemini");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `Lis ce texte en français avec une voix pédagogique et bienveillante : "${text}"` }] },
      ],
      generationConfig: {
        response_modalities: ["AUDIO"],
        speech_config: { voice_config: { prebuilt_voice_config: { voice_name: "Charon" } } },
      },
    }),
  });
  const parsed = await res.json();
  if (parsed.error) throw new Error(parsed.error.message);
  const part = parsed.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData?.data) return { audio: part.inlineData.data, mime: "audio/wav" };
  throw new Error("Pas d'audio Gemini");
}

async function synthesize(req, res) {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text requis." });

  const clean = cleanText(text);
  if (!clean) return res.json({ silent: true });

  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const audio = await elevenLabsTTS(clean, 4000);
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
