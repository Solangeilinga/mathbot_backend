// scripts/insertRealSubjects.js — Insère les vrais sujets BEPC 2021/2022/2023
// (Burkina Faso, 1er tour) dans exam_subjects, transcrits depuis les PDF
// officiels du Ministère (réf. EXAMENS ET CONCOURS SCOLAIRES / MENAPLN-SG-DGEC).
//
// Sources : examens-concours.net (2021) et epreuvesetcorriges.com (2022, 2023).
// Contrairement au sujet 2025 synthétique de insertTestSubject.js, ceci est le
// texte réel — majoritairement à réponse libre, comme les vrais examens BEPC.
// Stocké sous chapitre "Mixte" comme le sujet 2025 (un examen BEPC officiel
// couvre toujours plusieurs chapitres, jamais un seul).
//
// ⚠️ Aucun sujet 2020 trouvé : ni examens-concours.net ni epreuvesetcorriges.com
// n'en ont un pour le Burkina Faso (probablement lié aux perturbations de cette
// session). Une entrée "2020" trouvée sur epreuvesetcorriges.com a été vérifiée
// et rejetée : c'est en réalité un sujet béninois (en-tête "DEC-MESTFP"),
// mal catégorisé sur le site.

require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const ssl = process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false;

const pool = connectionString
  ? new Pool({ connectionString, ssl })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "bepcmath",
      ssl,
    });

const sujet2023 = `EXAMEN DU B.E.P.C
BURKINA FASO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION DE 2023

EPREUVE DE MATHEMATIQUES (1er tour)
(Calculatrices non autorisées)

Coefficient : 05
Durée : 2 Heures

Cette épreuve comporte deux (2) parties indépendantes à traiter obligatoirement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREMIERE PARTIE : (12 points)
Dans cette partie, toutes les questions sont indépendantes

I. Pour chacune des questions ci-dessous, écrire le numéro de la question suivi de la lettre correspondant à la bonne réponse.

1) Laquelle des expressions suivantes est celle d'une application linéaire ?
a) -3/4 x + y - 1
b) -5x²
c) x/2 + x
d) -5x
(1pt)

2) Soit (D) la droite d'équation : 2x - 1/3 y - 3 = 0. Quel est le coefficient directeur de la droite (D) ?
a) 1/3
b) 2
c) 6
d) 1/6
(1pt)

3) Quelle est la distance entre les réels 11 et -3 ?
a) 11
b) 14
c) 11/3
d) -3/11
(1pt)

II.
1) Rendre rationnel le dénominateur de l'expression suivante : F = -2/(2+√3)
(1pt)

2) Résoudre dans R × R le système (E) : { 3x + y - 5 = 0 ; x - 2y + 3 = 0 }
(1pt)

3) Factoriser le polynôme suivant : t(x) = (x-2)(2x-3) - (x+1)(2-x)
(1pt)

4) Soit q la fonction rationnelle définie par q(x) = 2x / (x + 1/2). Déterminer l'ensemble de définition de q noté Dq
(1pt)

5) Dans un repère cartésien (O, i, j) on donne M(-3;5) et P(-5/2;7). Calculer les coordonnées du vecteur MP
(1pt)

6) ABC est un triangle rectangle en A tel que AB = 4 cm et BC = 5 cm. Calculer le rapport de projection orthogonale k de (BC) sur (AB).
(1pt)

7) Justifier que les droites (D): y = -1/2 x + 3 et (D'): -2x + y - 6 = 0 sont perpendiculaires.
(1pt)

8) On considère la figure ci-contre où (C) est un cercle de centre O et E, F, G et H des points du cercle. On donne l'angle EGH = 27°. Déterminer les valeurs des angles EOH et EFH.
(1pt)

9) Dans la figure ci-dessous la droite (KN) est parallèle à la droite (LM). Identifier deux triangles qui forment une configuration de Thalès.
(1pt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEUXIEME PARTIE : (08 points)

EXERCICE 1 (3pts)
Un jardin rectangulaire mesure 10 m de longueur sur 6 m de largeur. On augmente sa longueur puis sa largeur de x mètres (x strictement positif).
1) Justifier que le périmètre du nouveau jardin est P = 4x + 32. On rappelle P = 2(L + l). (1pt)
2) Déterminer l'ensemble des valeurs possibles de x pour lesquelles le périmètre P reste inférieur ou égal à 96 m. (2pts)

EXERCICE 2 (5pts)
Le plan est muni d'un repère orthonormé (O, i, j) unité graphique 1 cm. On donne les points : A(1;3) ; B(-3;1) et C(0;-5).
1) a) Calculer les coordonnées des vecteurs AB ; AC et BC. (1,5pts)
   b) En déduire que les droites (AB) et (BC) sont perpendiculaires. (1pt)
2) Déterminer une équation cartésienne de la droite (AB). (1pt)
3) Soit (Δ) la droite d'équation cartésienne y = -5x + 2 dans un repère du plan. Les points E(a;2) et F(-2;b) appartiennent à la droite (Δ). Déterminer les réels a et b. (1,5pt)

FIN DU SUJET`;

const sujet2022 = `EXAMEN DU B.E.P.C
BURKINA FASO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION DE 2022

EPREUVE DE MATHEMATIQUES (1er tour)
(L'usage de la calculatrice n'est pas autorisé)

Coefficient : 05
Durée : 02 heures

Cette épreuve comporte deux (2) parties indépendantes à traiter obligatoirement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREMIERE PARTIE : (12 points)
Dans cette partie, toutes les questions sont indépendantes

I. Pour les 6 questions du I), reproduire le tableau suivant et le compléter par la lettre correspondant à la bonne réponse.

1°) Soit f une application affine croissante. Parmi les affirmations suivantes laquelle est vraie ?
a) f(-8) > f(1)
b) f(5) < f(-7)
c) f(-5) < f(8)
d) f(-4) ≥ f(6)
(1 pt)

2°) Dans le plan muni d'un repère orthonormé (O, i, j), on donne : A(7/2 ; -2) ; B(2 ; -3/2). Quelles sont les coordonnées du vecteur AB ?
a) (3/2 ; 1/2)
b) (-3/2 ; -1/3)
c) (-3/2 ; 1/2)
d) (-3 ; 1)
(1 pt)

3°) BIC est un triangle rectangle en B tel que IC = 6 cm et sin(CÎB) = 1/2. Quelle est la valeur de BC ?
a) 6
b) 3
c) 12
d) 14
(1 pt)

4°) Laquelle des expressions f(x) suivantes est celle d'une application linéaire ?
a) (√2-1)x + 1
b) -3x + 3/2
c) -1/√2 x
d) 3x²
(1 pt)

5°) Soit q la fonction rationnelle définie sur R\\{-3} par q(x) = (x - 1/2)/(x + 3). Quelle est l'image par q du réel -1/2 ?
a) 0
b) -2/5
c) -4/5
d) -5/4
(1 pt)

6°) Lequel des vecteurs suivants est un vecteur directeur de la droite (D) dont le coefficient directeur est égal à -3/4 ?
a) V(1;-3/4)
b) V(1/3;1/4)
c) V(0;-1/4)
d) V(1/4;1/3)
(1 pt)

II.
1°) En utilisant l'identité remarquable qui convient, développer le polynôme A = (2√2 - x)². (1 pt)

2°) Résoudre dans R × R le système (S) en utilisant la méthode de substitution.
(S) { 2x - y = -3/2 ; x - 3y = -7 }
(1 pt)

3°) Dans un repère orthonormé du plan on donne les points A(-1;3) ; B(-4;5) et C(-5/2;4). Montrer que les points A, B et C sont alignés. (1 pt)

4°) Déterminer une équation de la droite (D) passant par le point A(3;4) et perpendiculaire à la droite (Δ) d'équation : x + y - 2 = 0. (1 pt)

5°) ABC est un triangle rectangle en C de hauteur [CH] tel que AB = 3√2 ; AC = 4 et BC = √2. Calculer la distance CH. (1 pt)

6°) Dans la figure suivante, (C) est cercle de centre O. Les points B, E et M appartiennent à (C). On donne : AOE = 110°. Calculer les mesures des angles AME et OBE. (1 pt)
(NB : Ne pas reproduire la figure)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEUXIEME PARTIE : (8 points)

EXERCICE 1 (3 pts)
Jean dispose de x francs. Il dépense la moitié pour son loyer et le tiers pour la scolarité de son fils. La somme de ses dépenses est inférieure ou égale à 50.000 francs et supérieure ou égale à 45.000 francs. Déterminer un encadrement de x.

EXERCICE 2 (5 pts)
La série statistique suivante représente les notes obtenues par les élèves d'une classe lors d'une composition.
Notes : [7;9[  [9;11[  [11;13[  [13;15[  [15;17[   Total
Effectifs : 9   15   22   16   2   x

1°) Déterminer x. (1 pt)
2°) Construire l'histogramme de cette série statistique (on prendra en abscisse 1 cm pour une note égale à 2 et en ordonnée 1 cm pour un effectif de 2) (1,5 pt)
3°) Calculer la moyenne de cette série statistique en utilisant les centres de classes. (1,5 pt)
4°) Calculer le pourcentage d'élèves ayant obtenu une note au moins égale à 11. (1 pt)

FIN DU SUJET`;

const sujet2021 = `EXAMEN DU B.E.P.C
BURKINA FASO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSION DE 2021

EPREUVE DE MATHEMATIQUES (1er tour)
(Calculatrice non autorisée)

Durée : 2 heures
Coefficient : 05

L'épreuve comporte deux (2) parties indépendantes à traiter obligatoirement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREMIERE PARTIE : (10 points)
Dans cette partie, toutes les questions sont indépendantes.

I. Pour répondre à chacune des questions suivantes, écrire le numéro de la question suivi de la lettre correspondant à la bonne réponse.

1) Parmi les couples de réels suivants, lequel est solution de l'inéquation 2x + 5y - 4 > 0 dans R × R ?
a) (2;-2)
b) (-2;2)
c) (-1/2;1)
d) (0;0)
(0,5pt)

2) Dans la figure suivante, le quadrilatère PQFE est un trapèze de bases [PQ] et [EF]. Quels sont les triangles qui forment une configuration de Thalès ?
a) OPE et OFQ
b) PFQ et PEQ
c) APF et AQE
d) OPQ et OFE
(0,5pt)

3) Soit f une application linéaire telle que f(-2) = 1/2. Quelle est l'expression f(x) pour tout réel x ?
a) f(x) = 1/2 x
b) f(x) = -x
c) f(x) = -2x
d) f(x) = -1/4 x
(0,5pt)

II.
1) Factoriser Q(x) = (x-1)² - 5(1-x) en produit de facteurs du premier degré. (1pt)
2) OIT est un triangle rectangle en I tel que IT = 2cm et Tan(TÔI) = 1/2. Calculer OI. (0,5pt)
3) Développer (x√2 - 3)(x√2 + 3) en utilisant l'identité remarquable qui convient. (1pt)
4) L'histogramme suivant représente les fréquences cumulées croissantes d'une série statistique. Quelle est la fréquence cumulée croissante de la classe [10;15[ ? (0,5pt)
5) Soit (D) la droite d'équation 2x - 1/3 y + 5 = 0 et E(x;-3) un point de (D). Déterminer l'abscisse x du point E. (0,5pt)
6) Utiliser l'identité remarquable qui convient pour factoriser 49x² + 14x + 1. (1pt)
7) Démontrer que les droites (D): 2x - 3y - 3 = 0 et (D'): -4x + 6y + 1 = 0 sont parallèles. (1pt)
8) ODE est un triangle tel que OD = 2, DE = 3 et EO = √13. Démontrer que le triangle ODE est un triangle rectangle dont on précisera le sommet de l'angle droit. (1pt)
9) Résoudre graphiquement le système { x + 3y - 1 = 0 ; -x - y + 3 = 0 } dans R × R. (On prendra 1 cm comme unité graphique) (1pt)
10) Dans la figure suivante, ABGFDCHE est un cube d'arête 4 cm. I est le milieu de [FG]. Calculer BI. (1pt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEUXIEME PARTIE : (10 points)
Les exercices de cette partie sont indépendants.

EXERCICE 1 (6pts)
Le plan est muni d'un repère orthonormé (O, i, j) d'unité le centimètre.
1) Placer les points A(-4;1), B(3;0) et C(0;-3). (1pt)
2) a) Calculer les distances AB, AC et BC. (1,5pt)
   b) En déduire que le triangle ABC est rectangle en C. (1pt)
3) Soit (C) le cercle circonscrit au triangle ABC.
   a) Déterminer les coordonnées du centre I de (C). (0,5pt)
   b) Déterminer une équation de la tangente (T) au cercle (C) en C. (1pt)
   c) Construire (C) et (T) dans le repère (O,i,j). (1pt)

EXERCICE 2 (4pts)
On considère la fonction rationnelle Q définie par Q(x) = (1-2x)(2-x) / ((1+x)(4x-2)).
1) Déterminer l'ensemble de définition DQ de Q. (1pt)
2) Montrer que Q(x) = (x-2)/(2(x+1)) pour tout réel x de DQ. (1pt)
3) a) Calculer Q(√2) et rendre rationnel le dénominateur. (1pt)
   b) Donner un encadrement de Q(√2) à 10⁻² près. On donne 1,414 < √2 < 1,415. (1pt)

FIN DU SUJET`;

const SUBJECTS = [
  { session: "2023", chapitre: "Mixte", sujet: sujet2023 },
  { session: "2022", chapitre: "Mixte", sujet: sujet2022 },
  { session: "2021", chapitre: "Mixte", sujet: sujet2021 },
];

async function insertRealSubjects() {
  console.log("📝 Insertion des vrais sujets BEPC 2021/2022/2023...");
  try {
    for (const s of SUBJECTS) {
      await pool.query(
        `INSERT INTO exam_subjects (session, chapitre, sujet)
         VALUES ($1, $2, $3)
         ON CONFLICT (session, chapitre) DO UPDATE SET sujet = EXCLUDED.sujet`,
        [s.session, s.chapitre, s.sujet]
      );
      console.log(`  ✅ ${s.session} (${s.chapitre})`);
    }
    console.log("✅ Terminé.");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

insertRealSubjects();
