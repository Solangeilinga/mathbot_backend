# 🦉 MathBot — Backend (Express + PostgreSQL)

API du tuteur IA MathBot pour le BEPC (Burkina Faso). Ce backend est
indépendant : il expose une API REST consommée par le frontend séparé
(`mathbot_frontend`, Vite + React), tout comme dans l'architecture d'origine
à deux dépôts — mais avec PostgreSQL (au lieu de MySQL), le streaming du chat,
et le RAG sur les annales.

## 📂 Structure

```
mathbot_backend/
├── server.js                  # Point d'entrée Express (Helmet, CORS, routes)
├── middlewares/
│   ├── auth.js                 # Vérification JWT réelle (signToken, authMiddleware)
│   └── rateLimit.js             # Limiteurs express-rate-limit par route
├── routes/                     # Déclaration des routes Express par domaine
├── controllers/                # Logique métier de chaque route
├── lib/
│   ├── db.js                   # Pool PostgreSQL + query/queryOne/run
│   ├── ai.js                   # Clients Groq/Gemini + streamChatText (streaming)
│   ├── rag.js                  # Recherche vectorielle (RAG) sur les annales
│   ├── prompts.js              # Tous les prompts système
│   ├── memory.js               # Génération du profil pédagogique
│   └── user.js                 # resolvePrenom()
├── db/
│   ├── schema.sql              # Schéma PostgreSQL principal
│   ├── schema.rag.sql          # Schéma optionnel (pgvector + annales_chunks)
│   └── init.js                 # Script d'initialisation
├── scripts/
│   ├── insertTestSubject.js    # Insère le sujet BEPC 2025 de test
│   └── indexAnnales.js         # Indexe les annales pour le RAG (embeddings)
└── .env.example
```

## 🚀 Démarrage

```bash
npm install
cp .env.example .env
# Renseignez DATABASE_URL, JWT_SECRET, GROQ_API_KEY/GEMINI_API_KEY, CORS_ORIGIN

npm run db:init          # crée les tables PostgreSQL
npm run db:seed          # (optionnel) sujet BEPC 2025 de test
npm run db:index-rag     # (optionnel) indexe les annales pour le RAG

npm run dev              # démarre sur http://localhost:5000
```

Vérifiez que ça tourne :
```bash
curl http://localhost:5000/api/health
```

## 🔐 CORS

`CORS_ORIGIN` dans `.env` doit contenir l'URL exacte du frontend (Vite en dev :
`http://localhost:5173`). Plusieurs origines possibles, séparées par des
virgules (utile si vous avez un frontend web + une app mobile par ex.).

## 🔒 Sécurité

`middlewares/auth.js` vérifie réellement la signature et l'expiration du JWT
sur toutes les routes protégées (`authMiddleware`). C'est la correction du
bug identifié dans l'architecture d'origine, où le middleware d'authentification
Express acceptait n'importe quel token et injectait toujours le même
utilisateur fictif.

## 🌊 Streaming du chat

`app/api/chat/message` et `chat/welcome` (ici `routes/chat.js` +
`controllers/chatController.js`) ne renvoient plus un JSON unique une fois la
réponse entièrement générée : la réponse HTTP est ouverte immédiatement
(`res.writeHead` + `res.write` en boucle), et le texte de l'IA est envoyé au
fur et à mesure qu'il est généré par Groq/Gemini (`lib/ai.js` →
`streamChatText`, générateur async). La sauvegarde en base (historique,
progression, profil pédagogique) se fait après `res.end()`.

*Limite connue* : une fois `res.writeHead(200, ...)` envoyé, le code de statut
ne peut plus changer. Une erreur survenant **pendant** la génération (ex.
coupure de l'API IA à mi-réponse) est donc ajoutée comme texte visible
("⚠️ MathBot a rencontré une erreur…") plutôt que remontée comme une erreur
HTTP distincte.

## 🧠 RAG sur les annales BEPC réelles

Avant de générer un exercice, l'API récupère les exercices les plus proches
sémantiquement dans une base vectorielle (PostgreSQL + `pgvector`) et les
injecte dans le prompt système — au lieu de laisser l'IA inventer librement.
Embeddings : `gemini-embedding-001` (Google), en dimension 768.

```bash
npm run db:init                 # crée la table annales_chunks (si pgvector dispo)
npm run db:index-real-annales   # indexe le corpus de vraies annales (data/annales-corpus.js)
npm run rag:eval                # mesure la qualité du retrieval (voir plus bas)
```

### Corpus

`data/annales-corpus.js` contient des exercices **réellement tirés** d'épreuves
officielles du BEPC Burkina Faso (référence Ministère MESPFT/SG/DGECC),
sessions 2025 et 2013 (source : examens-concours.net). Différence clé avec
l'ancien pipeline (`scripts/indexAnnales.js` + `exam_subjects`, conservé pour
la simulation d'examen) : chaque **exercice individuel** est étiqueté avec son
vrai chapitre (Algèbre/Géométrie/Fonctions/Trigonométrie/Statistiques), au lieu
de taguer tout un sujet entier "Mixte" — c'est ce qui rend le filtre par
chapitre de `lib/rag.js` réellement discriminant plutôt que no-op.

*Limite assumée* : aucune des deux sessions récupérées ne contient de question
de Probabilités — ce chapitre n'a donc pas encore d'annale réelle indexée
(mieux vaut l'absence de couverture qu'un faux exercice étiqueté "vraie annale").

### Évaluation du retrieval (`scripts/evalRag.js`)

Jeu de 19 requêtes formulées "façon élève" (jamais le texte exact de
l'exercice), étiquetées à la main avec le chunk attendu. Deux niveaux :
- **Facile** (sujets topiquement distincts dans un même chapitre) : Recall@1 = 100 %, MRR = 1.000
- **Difficile** (plusieurs exercices proches du même chapitre, ex. 3 factorisations de polynômes en Algèbre) : Recall@1 = 75 %, Recall@2 = 100 %, MRR = 0.875

Le niveau difficile confirme empiriquement que `topK=2` (déjà utilisé par
`chatController`/`exerciseController`) est le bon compromis : le bon exercice
n'est pas toujours en 1ère position quand plusieurs se ressemblent, mais il est
systématiquement dans les 2 premiers sur ce jeu de test.

*Fonctionnalité dégradable* : si l'extension `pgvector` n'est pas installée
sur votre serveur PostgreSQL, `db/init.js` affiche un avertissement et
continue — le reste de l'API fonctionne normalement, simplement sans
grounding RAG (`lib/rag.js` retombe sur un tableau vide en cas d'erreur).

## 🧪 Évaluation offline du tuteur (`scripts/evalTutor.js`)

```bash
npm run tutor:eval
```

Rejoue les VRAIS prompts de production (`lib/prompts.js`) avec le VRAI
provider configuré (`lib/ai.js`), sur 10 scénarios représentatifs × 3 essais
(les LLM ne sont pas déterministes — un seul essai par scénario n'est pas
fiable). Deux types de vérification :
1. **Conformité de format** — les règles que le prompt impose explicitement
   (QCM à 4 options A-D + 1 réponse marquée, sections obligatoires, limite de
   mots, mots interdits), avec la même logique de parsing que le frontend
   (`ChatArea.jsx`, `ExerciseAnalyzer.jsx`).
2. **Exactitude mathématique (LLM-as-judge)** — un second appel LLM, à
   température quasi nulle, vérifie si la réponse marquée comme correcte
   l'est réellement. *Le juge est lui-même approximatif* (voir plus bas).

### Résultats (`openai/gpt-oss-120b` via Groq)

| Métrique | Avant renfort des prompts | Après |
|---|---|---|
| Conformité de format (toutes règles confondues) | 73 % | **95 %** |
| Exactitude mathématique jugée (LLM-as-judge, n=23) | *(invalide, voir plus bas)* | **17 VRAI / 2 FAUX / 4 INCERTAIN** |

**Deux bugs de PROMPT corrigés dans `lib/prompts.js`** (`buildSystemPrompt`,
`buildExercisePrompt`) : ajout d'exemples concrets (few-shot) et de rappels
explicites, après avoir constaté que le modèle omettait souvent la ligne
"✓ Bonne réponse" en mode chat et utilisait du **gras markdown** autour des
titres de section en mode analyseur — ce qui cassait le parsing frontend.
Conformité de format : 73 % → 95 % sur le même jeu de scénarios.

**Bug de PARSING découvert en cours de route, dans l'outil d'éval lui-même**
(et sa contrepartie en production) : `parseQCM` faisait
`correctLine.match(/[ABCD]/i)[0]` pour extraire la lettre marquée comme
correcte. Problème : le mot "**B**onne" (dans "✓ Bonne réponse : C") contient
un "B", qui matche AVANT la vraie lettre — la fonction retournait donc "B"
quasiment tout le temps, peu importe la lettre réellement écrite par le
modèle. Repéré parce que 100 % des verdicts d'un run affichaient
"réponse marquée B", statistiquement impossible. **Le même bug existait dans
le code de production, `ChatArea.jsx::parseExercise`** — en conditions
réelles, l'option B était donc systématiquement créditée comme "bonne
réponse" côté élève, peu importe la vraie réponse. Corrigé dans les deux
fichiers (ancrage sur `✓`/`bonne réponse :` + frontière de mot après la
lettre, pour ne plus capter le "B" de "Bonne").

Une fois ce bug corrigé, les verdicts du juge redeviennent exploitables :
sur 23 exercices générés, 2 erreurs de correction confirmées à la main (ex.
"5x + 2 = 27" correctement résolu en x = 5 dans le raisonnement du modèle,
mais l'option C = 6 marquée "bonne réponse" au lieu de B = 5) — soit un taux
de ~9 % d'erreurs de correction sur cet échantillon, résiduel après le renfort
des prompts (qui a corrigé le FORMAT mais pas entièrement l'EXACTITUDE).

**Limite du juge notée par honnêteté** : sur plusieurs cas jugés
"INCERTAIN" (surtout en trigonométrie), la vérification manuelle a montré que
la réponse du tuteur était en fait correcte — le juge LLM est donc lui-même
imparfait (par excès de prudence ici, pas par excès de confiance).

## ⚠️ Limitations connues

- **Rate limiting** (`express-rate-limit`) utilise un magasin en mémoire par
  défaut : sur un déploiement multi-instances, chaque instance a son propre
  compteur. Pour une limite stricte en production distribuée, utilisez un
  store partagé (ex. `rate-limit-redis`).
- **TTS** : sans `ELEVENLABS_API_KEY` ni `GEMINI_API_KEY`, l'API renvoie
  `{ silent: true }` — le frontend doit alors utiliser la synthèse vocale du
  navigateur en repli.
