// lib/ai.js — Fournisseurs IA : Groq (texte, priorité) et Gemini (vision + fallback texte)

let _groqClient = null;
let _geminiClient = null;

// "llama-3.3-70b-versatile" a été retiré du catalogue Groq (modèle introuvable,
// 404 model_not_found). Groq ne propose plus de modèles Llama classiques ;
// gpt-oss-120b est le plus proche en qualité pour un usage pédagogique en français.
const GROQ_MODEL = "openai/gpt-oss-120b";
// gpt-oss est un modèle de raisonnement : ses tokens de réflexion comptent dans
// max_tokens, d'où des budgets généreux dans les contrôleurs. Ne pas baisser
// reasoning_effort : un essai à "low" a nettement augmenté les lettres de
// "bonne réponse" erronées dans npm run tutor:eval.

const GEMINI_TEXT_MODEL = "gemini-flash-lite-latest";
const GEMINI_VISION_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest"];

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!_groqClient) {
    const Groq = require("groq-sdk");
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!_geminiClient) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    _geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _geminiClient;
}

/** Sélectionne le client texte à utiliser : Groq en priorité, sinon Gemini. */
function getTextClient() {
  const groq = getGroqClient();
  if (groq) return { type: "groq", client: groq };
  const gemini = getGeminiClient();
  if (gemini) return { type: "gemini", client: gemini };
  throw new Error("Aucune clé API (GROQ_API_KEY ou GEMINI_API_KEY)");
}

/** Appel simple "system + user" -> texte, quel que soit le fournisseur. */
async function completeChat({ systemPrompt, messages, maxTokens = 600, temperature = 0.85 }) {
  const { type, client } = getTextClient();

  if (type === "groq") {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature,
    });
    return completion.choices[0]?.message?.content || "";
  }

  const model = client.getGenerativeModel({
    model: GEMINI_TEXT_MODEL,
    systemInstruction: systemPrompt,
  });
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastUserMsg);
  return result.response.text();
}

/**
 * Analyse d'image (vision) — toujours Gemini. Les modèles "1.5-flash" et
 * "2.0-flash-lite" ont été retirés de l'API (404) : on utilise un modèle lite
 * daté, puis l'alias "-latest" en repli (il survit aux retraits). Les modèles lite
 * répondent en 1 à 3 s ; les modèles flash complets sont lents et souvent
 * saturés (503 "high demand" fréquents), d'où le délai d'expiration court.
 */
async function analyzeImage({ imageBase64, mimeType, prompt }) {
  const gemini = getGeminiClient();
  if (!gemini) throw new Error("GEMINI_API_KEY manquant — nécessaire pour la reconnaissance d'image.");

  const parts = [{ inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } }, prompt];
  let lastErr;
  for (const name of GEMINI_VISION_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = gemini.getGenerativeModel({ model: name }, { timeout: 25000 });
        const result = await model.generateContent(parts);
        return result.response.text();
      } catch (err) {
        lastErr = err;
        const overloaded = /\b503\b|high demand|overloaded/i.test(err.message);
        console.warn(`[ai] vision ${name} (essai ${attempt + 1}) :`, overloaded ? "503 forte demande" : String(err.message).slice(-120));
        if (!overloaded) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  throw lastErr;
}

/** Détecte un vrai dépassement de quota (et non la sous-chaîne "rate" de "generateContent"). */
function isRateLimitError(err) {
  return /quota|rate[ _-]?limit|too many requests|\b429\b/i.test(err?.message || "");
}

/**
 * Version "streaming" de completeChat : renvoie un générateur async qui produit
 * les morceaux de texte au fur et à mesure qu'ils arrivent du fournisseur IA
 * (Groq ou Gemini), pour un affichage progressif façon ChatGPT côté client.
 */
async function* streamChatText({ systemPrompt, messages, maxTokens = 600, temperature = 0.85 }) {
  const { type, client } = getTextClient();

  if (type === "groq") {
    const stream = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) yield delta;
      if (chunk.choices?.[0]?.finish_reason === "length") {
        console.warn("[ai] réponse tronquée (max_tokens atteint) :", maxTokens);
      }
    }
    return;
  }

  // Gemini
  const model = client.getGenerativeModel({
    model: GEMINI_TEXT_MODEL,
    systemInstruction: systemPrompt,
  });
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const chat = model.startChat({ history });
  const { stream } = await chat.sendMessageStream(lastUserMsg);
  for await (const chunk of stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

module.exports = {
  getGroqClient,
  getGeminiClient,
  getTextClient,
  completeChat,
  analyzeImage,
  streamChatText,
  isRateLimitError,
};
