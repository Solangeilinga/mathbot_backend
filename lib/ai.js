// lib/ai.js — Fournisseurs IA : Groq (texte, priorité) et Gemini (vision + fallback texte)

let _groqClient = null;
let _geminiClient = null;

// "llama-3.3-70b-versatile" a été retiré du catalogue Groq (modèle introuvable,
// 404 model_not_found). Groq ne propose plus de modèles Llama classiques ;
// gpt-oss-120b est le plus proche en qualité pour un usage pédagogique en français.
const GROQ_MODEL = "openai/gpt-oss-120b";

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
    model: "gemini-2.0-flash-lite",
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

/** Analyse d'image (vision) — toujours Gemini. */
async function analyzeImage({ imageBase64, mimeType, prompt }) {
  const gemini = getGeminiClient();
  if (!gemini) throw new Error("GEMINI_API_KEY manquant — nécessaire pour la reconnaissance d'image.");

  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
    prompt,
  ]);
  return result.response.text();
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
    }
    return;
  }

  // Gemini
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
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
};
