// scripts/evalTutor.js — Évaluation offline du tuteur IA (format + hallucinations).
//
// Objectif : au lieu de juger "ça a l'air de marcher" en testant à la main dans
// le chat, on rejoue les VRAIS prompts de production (lib/prompts.js) avec le
// VRAI provider configuré (lib/ai.js), sur un petit jeu de scénarios
// représentatifs, et on vérifie automatiquement deux choses :
//
//  1. Conformité de format — les règles que le prompt système impose
//     explicitement (QCM à 4 options A-D avec une seule bonne réponse
//     identifiable, limite de mots, mots interdits, sections obligatoires...).
//     Ces règles sont ré-implémentées ici de façon volontairement proche des
//     parseurs frontend (ChatArea.jsx::parseExercise, ExerciseAnalyzer.jsx::
//     parseAnalysis) : un exercice mal formaté côté IA cassera l'UI, donc
//     c'est littéralement le même contrat qu'on vérifie des deux côtés.
//
//  2. Exactitude mathématique (LLM-as-judge) — pour chaque QCM généré, un
//     second appel LLM, à température quasi nulle et avec un prompt de
//     vérification strict, juge si la réponse marquée comme correcte l'est
//     réellement. C'est une mesure APPROXIMATIVE (le juge peut lui aussi se
//     tromper) mais c'est le seul moyen automatisable de repérer les
//     hallucinations sans corriger chaque exercice à la main.
//
// Usage : npm run tutor:eval

require("dotenv").config();
const { completeChat } = require("../lib/ai");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Un hoquet réseau transitoire (Groq/Gemini/Supabase) ne doit pas faire
// perdre tout un essai — une seule retentative après une courte pause.
async function withRetry(fn, label) {
  try {
    return await fn();
  } catch (err) {
    console.log(`   ↻ ${label} a échoué (${err.message}), nouvelle tentative...`);
    await sleep(3000);
    return fn();
  }
}
const { buildSystemPrompt, buildWelcomeInstruction, buildExercisePrompt } = require("../lib/prompts");
const { retrieveRelevantExercises, formatRagContext } = require("../lib/rag");

// ─── Règles de format (contrat des prompts, cf. lib/prompts.js) ─────────────

const FORBIDDEN_WORDS = [/l'utilisateur/i, /l'apprenant/i, /\bl'élève\b/i];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function checkNoForbiddenWords(text) {
  const hits = FORBIDDEN_WORDS.filter((re) => re.test(text));
  return { name: "mots interdits", pass: hits.length === 0, detail: hits.length ? `trouvé: ${hits.join(", ")}` : "ok" };
}

function checkWordLimit(text, max) {
  const n = countWords(text);
  const tolerance = Math.round(max * 1.2); // les LLM dépassent souvent légèrement une consigne de longueur
  return { name: `longueur (max ${max} mots)`, pass: n <= tolerance, detail: `${n} mots (tolérance ${tolerance})` };
}

function checkMentionsPrenom(text, prenom) {
  return { name: "prénom utilisé", pass: text.toLowerCase().includes(prenom.toLowerCase()), detail: text.includes(prenom) ? "ok" : `"${prenom}" absent` };
}

// Même logique que ChatArea.jsx::parseExercise — un QCM A/B/C/D + une ligne "✓ Bonne réponse".
function parseQCM(content) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const optReg = /^([ABCD])[.)•\-]\s+(.+)/i;
  const options = lines.filter((l) => optReg.test(l)).map((l) => {
    const m = l.match(optReg);
    return { letter: m[1].toUpperCase(), text: m[2].trim() };
  });
  const correctLine = lines.find((l) => (l.includes("✓") && /[ABCD]/.test(l)) || /bonne\s+r[ée]ponse\s*:?\s*[ABCD]/i.test(l));
  // ⚠️ Ne PAS faire correctLine.match(/[ABCD]/i)[0] : "Bonne" contient un "B",
  // qui matche avant la vraie lettre (même bug trouvé et corrigé dans
  // ChatArea.jsx::parseExercise — voir ce fichier pour l'explication complète).
  const correctLetter = correctLine?.match(/(?:✓\s*|bonne\s+r[ée]ponse\s*:?\s*)([ABCD])\b/i)?.[1]?.toUpperCase() ?? null;
  const questionLines = lines.filter((l) => !optReg.test(l) && !/bonne\s+r[ée]ponse|✓/i.test(l));
  return { options, correctLetter, question: questionLines.join(" ") };
}

function checkQCMStructure(content) {
  const { options, correctLetter } = parseQCM(content);
  const letters = options.map((o) => o.letter);
  const unique = new Set(letters);
  const hasAllFour = ["A", "B", "C", "D"].every((l) => unique.has(l));
  const noDup = unique.size === letters.length;
  const hasCorrect = !!correctLetter && unique.has(correctLetter);
  const pass = hasAllFour && noDup && hasCorrect;
  return {
    name: "structure QCM (4 options A-D + 1 réponse marquée)",
    pass,
    detail: `options=[${letters.join(",")}] correct=${correctLetter ?? "?"}`,
  };
}

const SECTION_MARKERS = [
  ["📌 ANALYSE", /📌\s*ANALYSE/i],
  ["📖 EXPLICATION", /📖\s*EXPLICATION/i],
  ["✅ SOLUTION", /✅\s*SOLUTION/i],
  ["🎯 ENTRAÎNE-TOI", /🎯\s*ENTRAÎNE-TOI/i],
];

function checkSections(text) {
  const missing = SECTION_MARKERS.filter(([, re]) => !re.test(text)).map(([name]) => name);
  return { name: "4 sections obligatoires", pass: missing.length === 0, detail: missing.length ? `manquantes: ${missing.join(", ")}` : "ok" };
}

function extractExerciseBlocks(text) {
  const exReg = /Exercice\s+(\d+)\s*:\s*([^\n]+)([\s\S]*?)(?=Exercice\s+\d+|$)/gi;
  const blocks = [];
  let m;
  while ((m = exReg.exec(text)) !== null) blocks.push({ num: m[1], body: m[2] + "\n" + m[3] });
  return blocks;
}

// ─── Juge LLM : l'exercice généré est-il mathématiquement correct ? ─────────

async function judgeAnswer({ chapitre, question, options, correctLetter }) {
  const optionsText = options.map((o) => `${o.letter}. ${o.text}`).join("\n");
  const prompt = `Question de mathématiques (BEPC, chapitre ${chapitre}) :
${question}

Options :
${optionsText}

La réponse marquée comme correcte est "${correctLetter}". Est-ce mathématiquement exact ?
Réponds STRICTEMENT sous ce format, rien d'autre :
VERDICT: VRAI ou FAUX ou INCERTAIN
JUSTIFICATION: une phrase courte`;

  const result = await completeChat({
    systemPrompt: "Tu es un professeur de mathématiques rigoureux qui vérifie des corrections d'examen BEPC. Tu ne fais aucune concession : si le calcul ou le raisonnement est faux, tu le dis clairement.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 700,
    temperature: 0.1,
  });
  const verdict = result.match(/VERDICT:\s*(VRAI|FAUX|INCERTAIN)/i)?.[1]?.toUpperCase() || "INCERTAIN";
  const justification = result.match(/JUSTIFICATION:\s*(.+)/i)?.[1]?.trim() || result.trim().slice(0, 200);
  return { verdict, justification };
}

// ─── Scénarios (rejouent fidèlement les prompts de production) ─────────────

async function genWelcome({ chapitre, prenom, profil, hasHistory, maxWords }) {
  const systemPrompt = buildSystemPrompt(chapitre, profil, prenom);
  const instruction = buildWelcomeInstruction(prenom, chapitre, profil, hasHistory);
  const text = await completeChat({ systemPrompt, messages: [{ role: "user", content: instruction }], maxTokens: 700, temperature: 0.92 });
  const checks = [checkNoForbiddenWords(text), checkWordLimit(text, maxWords), checkMentionsPrenom(text, prenom)];
  return { text, checks, exercises: [] };
}

async function genChat({ chapitre, prenom, message, maxWords, expectQCM }) {
  const ragChunks = await retrieveRelevantExercises({ chapitre, queryText: message, topK: 3 });
  const systemPrompt = buildSystemPrompt(chapitre, null, prenom) + formatRagContext(ragChunks);
  const text = await completeChat({ systemPrompt, messages: [{ role: "user", content: message }], maxTokens: 1600, temperature: 0.85 });
  const checks = [checkNoForbiddenWords(text), checkWordLimit(text, maxWords)];
  const exercises = [];
  if (expectQCM) {
    const qcmCheck = checkQCMStructure(text);
    checks.push(qcmCheck);
    const { options, correctLetter, question } = parseQCM(text);
    if (qcmCheck.pass) exercises.push({ chapitre, question, options, correctLetter });
  }
  return { text, checks, exercises };
}

async function genExerciseAnalysis({ chapitre, prenom, exerciseText, maxWords }) {
  const ragChunks = await retrieveRelevantExercises({ chapitre, queryText: exerciseText, topK: 3 });
  const systemPrompt = buildExercisePrompt(prenom, chapitre, null) + formatRagContext(ragChunks);
  const userMessage = `Voici l'exercice à analyser :\n\n${exerciseText}\n\nAnalyse-le et suis le format demandé.`;
  const text = await completeChat({ systemPrompt, messages: [{ role: "user", content: userMessage }], maxTokens: 2600, temperature: 0.7 });
  const checks = [checkWordLimit(text, maxWords), checkSections(text)];
  const blocks = extractExerciseBlocks(text);
  checks.push({ name: "2 exercices d'entraînement générés", pass: blocks.length === 2, detail: `trouvé: ${blocks.length}` });
  const exercises = [];
  for (const block of blocks) {
    const qcmCheck = checkQCMStructure(block.body);
    checks.push(qcmCheck);
    const { options, correctLetter, question } = parseQCM(block.body);
    if (qcmCheck.pass) exercises.push({ chapitre, question, options, correctLetter });
  }
  return { text, checks, exercises };
}

const SCENARIOS = [
  { id: "welcome-1ere-session", run: () => genWelcome({ chapitre: "Algèbre", prenom: "Awa", profil: null, hasHistory: false, maxWords: 80 }) },
  { id: "welcome-retour-lacunes", run: () => genWelcome({ chapitre: "Géométrie", prenom: "Issouf", profil: { lacunes: ["Théorème de Pythagore"], notions_a_retravailler: [], niveau_global: "intermédiaire" }, hasHistory: true, maxWords: 90 }) },
  { id: "exercice-probabilites", run: () => genChat({ chapitre: "Probabilités", prenom: "Fatim", message: "Donne-moi un nouvel exercice BEPC varié avec 4 options A B C D", maxWords: 250, expectQCM: true }) },
  { id: "exercice-fonctions", run: () => genChat({ chapitre: "Fonctions", prenom: "Karim", message: "Donne-moi un nouvel exercice BEPC varié avec 4 options A B C D", maxWords: 250, expectQCM: true }) },
  { id: "exercice-trigonometrie", run: () => genChat({ chapitre: "Trigonométrie", prenom: "Aminata", message: "Donne-moi un nouvel exercice BEPC varié avec 4 options A B C D", maxWords: 250, expectQCM: true }) },
  { id: "exercice-algebre", run: () => genChat({ chapitre: "Algèbre", prenom: "Awa", message: "Donne-moi un nouvel exercice BEPC varié avec 4 options A B C D", maxWords: 250, expectQCM: true }) },
  { id: "explication-quotidien", run: () => genChat({ chapitre: "Algèbre", prenom: "Awa", message: "Je ne comprends pas, explique autrement avec un exemple simple du quotidien burkinabè", maxWords: 250, expectQCM: false }) },
  { id: "correction-reponse-fausse", run: () => genChat({ chapitre: "Géométrie", prenom: "Issouf", message: "Réponse \"B\" incorrecte Issouf. Explique gentiment l'erreur, donne la correction pas-à-pas et encourage.", maxWords: 250, expectQCM: false }) },
  { id: "analyzer-algebre", run: () => genExerciseAnalysis({ chapitre: "Algèbre", prenom: "Awa", exerciseText: "Résoudre l'équation : 2x + 5 = 13", maxWords: 400 }) },
  { id: "analyzer-geometrie", run: () => genExerciseAnalysis({ chapitre: "Géométrie", prenom: "Karim", exerciseText: "ABC est un triangle rectangle en A avec AB = 3 cm et AC = 4 cm. Calculer BC.", maxWords: 400 }) },
];

// Les LLM sont non-déterministes (température 0.7-0.92 dans les prompts de
// prod) : un seul essai par scénario donne un résultat bruité qui peut
// complètement changer d'un run à l'autre. On répète chaque scénario et on
// rapporte un TAUX de conformité par règle plutôt qu'un pass/fail sur un coup
// de dé — sinon l'éval elle-même n'est pas fiable.
const N_TRIALS = 3;

async function main() {
  console.log(`🧪 Évaluation offline du tuteur — ${SCENARIOS.length} scénarios × ${N_TRIALS} essais (appels LLM réels)\n`);

  const allResults = [];
  const allExercises = [];

  for (const scenario of SCENARIOS) {
    console.log(`▶ ${scenario.id}`);
    const checksByName = {};
    let errors = 0;

    for (let trial = 1; trial <= N_TRIALS; trial++) {
      try {
        const { checks, exercises } = await withRetry(() => scenario.run(), scenario.id);
        for (const c of checks) {
          if (!checksByName[c.name]) checksByName[c.name] = { pass: 0, total: 0, lastFailDetail: "" };
          checksByName[c.name].total++;
          if (c.pass) checksByName[c.name].pass++;
          else checksByName[c.name].lastFailDetail = c.detail;
        }
        for (const ex of exercises) allExercises.push({ scenario: scenario.id, trial, ...ex });
      } catch (err) {
        errors++;
        console.log(`   💥 essai ${trial} — ERREUR: ${err.message}`);
      }
      await sleep(1500); // laisse respirer Groq/Gemini/Supabase entre deux appels
    }

    for (const [name, s] of Object.entries(checksByName)) {
      const rate = s.pass / s.total;
      const icon = rate === 1 ? "✅" : rate > 0 ? "⚠️" : "❌";
      console.log(`   ${icon} ${name} : ${s.pass}/${s.total}${rate < 1 ? `  (ex. échec: ${s.lastFailDetail})` : ""}`);
    }
    allResults.push({ id: scenario.id, checksByName, errors });
  }

  // ─── Juge mathématique sur tous les QCM générés ───────────────────────────
  console.log(`\n🔬 Vérification mathématique de ${allExercises.length} exercice(s) généré(s) (LLM-as-judge)...\n`);
  const verdicts = { VRAI: 0, FAUX: 0, INCERTAIN: 0, ERREUR: 0 };
  for (const ex of allExercises) {
    let verdict, justification;
    try {
      ({ verdict, justification } = await withRetry(() => judgeAnswer(ex), `juge (${ex.scenario})`));
    } catch (err) {
      verdict = "ERREUR";
      justification = err.message;
    }
    verdicts[verdict] = (verdicts[verdict] || 0) + 1;
    const icon = verdict === "VRAI" ? "✅" : verdict === "FAUX" ? "🚨" : "❓";
    console.log(`${icon} [${ex.scenario}] réponse marquée "${ex.correctLetter}" → ${verdict} — ${justification}`);
    if (verdict === "FAUX" || verdict === "INCERTAIN") {
      console.log(`   Énoncé : ${ex.question}`);
      console.log(`   Options : ${ex.options.map((o) => `${o.letter}. ${o.text}`).join(" | ")}`);
    }
    await sleep(1500);
  }

  // ─── Résumé ────────────────────────────────────────────────────────────────
  let totalChecks = 0;
  let totalPass = 0;
  for (const r of allResults) {
    for (const s of Object.values(r.checksByName)) {
      totalChecks += s.total;
      totalPass += s.pass;
    }
  }
  console.log("\n─── Résumé ───────────────────────────────────");
  console.log(`Conformité de format : ${totalPass}/${totalChecks} vérifications passées (${Math.round((totalPass / totalChecks) * 100)}%) sur ${SCENARIOS.length} scénarios × ${N_TRIALS} essais`);
  console.log(`Exercices générés    : ${allExercises.length}`);
  console.log(`Jugés VRAI           : ${verdicts.VRAI || 0}`);
  console.log(`Jugés FAUX (🚨)       : ${verdicts.FAUX || 0}`);
  console.log(`Jugés INCERTAIN      : ${verdicts.INCERTAIN || 0}`);
  if (verdicts.ERREUR) console.log(`Erreurs juge         : ${verdicts.ERREUR}`);
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err.message);
  process.exitCode = 1;
});
