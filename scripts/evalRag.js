// scripts/evalRag.js — Évaluation offline de la qualité du retrieval RAG.
//
// Principe : un petit jeu de requêtes étiquetées à la main (formulées "façon
// élève", volontairement différentes du texte exact de l'exercice visé) avec,
// pour chacune, le chapitre et un identifiant du chunk qu'on attend en tête de
// liste. On appelle retrieveRelevantExercises() comme le fait l'app en
// production, et on mesure le rang réel du chunk attendu.
//
// Métriques rapportées : Recall@1 / @2 / @3 (le chunk attendu est-il dans le
// top-K ?) et MRR (Mean Reciprocal Rank, sensible à la position exacte).
//
// Usage : npm run rag:eval

require("dotenv").config();
const { retrieveRelevantExercises } = require("../lib/rag");

// Nombre max de chunks dans un même chapitre du corpus actuel (Algèbre = 22) —
// sert de topK pour obtenir un classement complet et calculer un vrai rang.
const FULL_RANK_TOPK = 25;

// Niveau "facile" : chaque requête cible un exercice topiquement distinct des
// autres du même chapitre (vocabulaire assez discriminant à lui seul).
const EVAL_SET_EASY = [
  { chapitre: "Algèbre", query: "un exercice avec un système d'équations sur des têtes et des pattes d'animaux", expect: "lièvres et y perdrix" },
  { chapitre: "Algèbre", query: "comparer deux nombres réels écrits avec des racines carrées", expect: "a = 3√5 et b = 2√11" },
  { chapitre: "Algèbre", query: "un problème avec des inéquations sur des prix d'achats de volailles", expect: "pintades" },
  { chapitre: "Géométrie", query: "calculer la distance entre deux points dans un repère orthonormé", expect: "A(3 ; -1) et B(-1 ; 2)" },
  { chapitre: "Géométrie", query: "un exercice sur une pyramide avec une base carrée", expect: "pyramide dont la base est le carré" },
  { chapitre: "Géométrie", query: "montrer que deux vecteurs sont égaux et en déduire des inconnues", expect: "vecteurs u(-a+1" },
  { chapitre: "Géométrie", query: "un triangle équilatéral inscrit dans un cercle avec plusieurs points", expect: "OEF un triangle équilatéral" },
  { chapitre: "Fonctions", query: "trouver l'ensemble de définition d'une fonction rationnelle", expect: "fonction rationnelle définie par q(x)" },
  { chapitre: "Fonctions", query: "une fonction avec des valeurs absolues à représenter graphiquement", expect: "f(x) = |(1/2)x|" },
  { chapitre: "Trigonométrie", query: "calculer une distance avec le cosinus d'un angle dans un triangle rectangle", expect: "cos(30°) = √3/2" },
  { chapitre: "Statistiques", query: "trouver la classe modale d'une série statistique", expect: "classe modale de cette série statistique" },
];

// Niveau "difficile" : plusieurs exercices du MÊME chapitre partagent le même
// thème générique (ex. 3 factorisations de polynômes en Algèbre) — la requête
// reste volontairement vague pour voir si le retrieval sait quand même
// distinguer le bon exercice parmi des candidats très proches.
const EVAL_SET_HARD = [
  // 3 candidats plausibles : 2013 Q2, 2013 Q3, 2025 II.5 sont tous des factorisations de polynôme
  { chapitre: "Algèbre", query: "comment factoriser un polynôme en utilisant une identité remarquable du second degré", expect: "3x² + 2x√3 + 1" },
  { chapitre: "Algèbre", query: "factoriser une expression en développant puis en mettant un facteur commun", expect: "(x-1)² + 3(x+3)(x-1)" },
  { chapitre: "Algèbre", query: "écrire un polynôme du second degré sous forme d'un produit de deux facteurs du premier degré", expect: "9x² - 6x + 1 + (3+5x)(4-12x)" },
  // 2 candidats plausibles : 2013 Q1 (inéquation simple) vs 2013 Partie2 II (système d'inéquations)
  { chapitre: "Algèbre", query: "un exercice sur les inéquations à deux inconnues", expect: "2x + 3y > 6" },
  // 2 candidats plausibles : 2013 Q4 (système résolu graphiquement) vs 2025 II.1 (système via mise en équation)
  { chapitre: "Algèbre", query: "résoudre un système d'équations", expect: "2x + y = 5" },
  // 2 candidats plausibles en Géométrie : distance dans un repère (I.2) vs cercle circonscrit (Exercice 1, qui calcule aussi des distances)
  { chapitre: "Géométrie", query: "un exercice de géométrie avec des calculs de distances", expect: "A(3 ; -1) et B(-1 ; 2)" },
  // 2 candidats en Trigonométrie, tous deux "triangle rectangle" — seul l'angle cherché (cos vs sin) diffère
  { chapitre: "Trigonométrie", query: "un triangle rectangle où il faut utiliser le cosinus d'un angle donné pour trouver une longueur", expect: "cos(30°) = √3/2" },
  { chapitre: "Trigonométrie", query: "un triangle rectangle où il faut calculer le sinus d'un angle à partir des trois côtés", expect: "AB = 6, BC = 8, AC = 10" },
];

async function evalOne(item) {
  const results = await retrieveRelevantExercises({
    chapitre: item.chapitre,
    queryText: item.query,
    topK: FULL_RANK_TOPK,
  });
  const rank = results.findIndex((r) => r.content.includes(item.expect)) + 1; // 0 si absent
  return { ...item, rank: rank || null, candidates: results.length };
}

function summarize(outcomes) {
  const n = outcomes.length;
  const recallAt = (k) => outcomes.filter((o) => o.rank && o.rank <= k).length / n;
  const mrr = outcomes.reduce((sum, o) => sum + (o.rank ? 1 / o.rank : 0), 0) / n;
  return { n, recall1: recallAt(1), recall2: recallAt(2), recall3: recallAt(3), mrr };
}

function printTier(name, outcomes) {
  console.log(`\n=== ${name} (${outcomes.length} requêtes) ===`);
  for (const o of outcomes) {
    const status = o.rank === 1 ? "🥇" : o.rank && o.rank <= 3 ? "✅" : o.rank ? "〰️" : "❌";
    console.log(`${status} [${o.chapitre}] rang=${o.rank ?? "—"}/${o.candidates}  "${o.query}"`);
  }
  const s = summarize(outcomes);
  console.log(`→ Recall@1=${(s.recall1 * 100).toFixed(0)}%  Recall@2=${(s.recall2 * 100).toFixed(0)}%  Recall@3=${(s.recall3 * 100).toFixed(0)}%  MRR=${s.mrr.toFixed(3)}`);
  return s;
}

async function main() {
  console.log(`🔎 Évaluation du RAG (corpus = 66 chunks réels, sessions BEPC 2025/2023/2022/2021/2013)`);

  const easyOutcomes = [];
  for (const item of EVAL_SET_EASY) easyOutcomes.push(await evalOne(item));
  const hardOutcomes = [];
  for (const item of EVAL_SET_HARD) hardOutcomes.push(await evalOne(item));

  const easyStats = printTier("Niveau FACILE — sujets distincts", easyOutcomes);
  const hardStats = printTier("Niveau DIFFICILE — exercices proches dans le même chapitre", hardOutcomes);

  console.log("\n─── Résumé global ─────────────────────────");
  console.log(`Facile     : Recall@1=${(easyStats.recall1 * 100).toFixed(0)}%  MRR=${easyStats.mrr.toFixed(3)}  (n=${easyStats.n})`);
  console.log(`Difficile  : Recall@1=${(hardStats.recall1 * 100).toFixed(0)}%  MRR=${hardStats.mrr.toFixed(3)}  (n=${hardStats.n})`);
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err.message);
  process.exitCode = 1;
});
