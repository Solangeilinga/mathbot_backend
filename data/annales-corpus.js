// data/annales-corpus.js — Corpus RAG : vraies annales BEPC Burkina Faso, sourcées
// du Ministère (épreuves officielles, référence MESPFT/SG/DGECC), transcrites depuis
// les sujets originaux et étiquetées PAR EXERCICE (et non par document entier) —
// contrairement à l'ancien pipeline qui taguait tout un sujet "Mixte".
//
// Source : https://www.examens-concours.net/sujets_corriges_examen.php?pays1=BFA
// Sessions couvertes : 2025 (1er tour), 2013 (1er tour).
//
// ⚠️ Limite connue et assumée : aucune des deux sessions récupérées ne contient
// de question de Probabilités — ce chapitre n'a donc pas d'annale réelle indexée
// pour l'instant. Mieux vaut l'absence de couverture que d'y insérer un exercice
// inventé étiqueté comme "vraie annale".

const CORPUS = [
  // ── Session 2025 (1er tour) — MESPFT/SG/DGECC_2025 ────────────────────────
  {
    session: "2025",
    chapitre: "Fonctions",
    content:
      "[BEPC 2025, 1er tour — Partie 1, I.1] Laquelle des droites ci-dessous a pour coefficient directeur 3/2 ?\na) (D1) : -3x - 2y + 1 = 0\nb) (D2) : -6x - y + 2 = 0\nc) (D3) : -6x + 4y - 3 = 0\nd) (D4) : (2/3)x - y + 3/2 = 0",
  },
  {
    session: "2025",
    chapitre: "Géométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 1, I.2] Le plan étant muni d'un repère orthonormé, on donne les points A(3 ; -1) et B(-1 ; 2). Laquelle des distances ci-dessous est celle de AB ?\na) 5\nb) √5\nc) 4\nd) √7",
  },
  {
    session: "2025",
    chapitre: "Fonctions",
    content:
      "[BEPC 2025, 1er tour — Partie 1, I.3] Soit q la fonction rationnelle définie par q(x) = (2x+3)(2+x) / ((x-4)(-2x+3)). Quel est son ensemble de définition ?\na) R \\ {4 ; 2/3}\nb) R \\ {-3/2 ; 4}\nc) R \\ {3/2 ; 4}\nd) R \\ {4 ; -2/3}",
  },
  {
    session: "2025",
    chapitre: "Algèbre",
    content:
      "[BEPC 2025, 1er tour — Partie 1, I.4] Soit le nombre réel A = (√3-1)/(√3+1). Lequel des nombres suivants est égal à A ?\na) -2 - √3\nb) -2 + √3\nc) 2 + √3\nd) 2 - √3",
  },
  {
    session: "2025",
    chapitre: "Statistiques",
    content:
      "[BEPC 2025, 1er tour — Partie 1, I.5] Soit la série statistique ci-dessous donnant en un jour l'âge des patients dans un CSPS.\nÂge en année : [0;10[ [10;20[ [20;30[ [30;40[ [40;50[ [50;60[\nNombre de patients : 12, 2, 6, 7, 9, 11\nQuelle est la classe modale de cette série statistique ?\na) [20;30[\nb) [40;50[\nc) [0;10[\nd) [50;60[",
  },
  {
    session: "2025",
    chapitre: "Algèbre",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.1] Soient x et y deux réels. Pendant la période autorisée, un chasseur tue x lièvres et y perdrix. Sachant qu'il a en tout 10 têtes et 26 pattes,\na) Déterminer le système d'équations où x et y sont solutions.\nb) Déterminer x et y.",
  },
  {
    session: "2025",
    chapitre: "Fonctions",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.2] Soit l'application affine f définie par f(x) = (-1/2)x + 2. Déterminer l'antécédent de 0 par f.",
  },
  {
    session: "2025",
    chapitre: "Trigonométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.3] Soit un triangle ABC rectangle en A. Sans reproduire la figure, calculer la distance BC sachant que cos(30°) = √3/2, avec AB = 5√3 et l'angle en C de 30°.",
  },
  {
    session: "2025",
    chapitre: "Géométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.4] La figure ci-contre est une pyramide dont la base est le carré ABCD de centre I et de hauteur [SI] telle que AC = 4√2, AS = 6√2.\na) Quelle est la nature du triangle AIS ?\nb) Calculer la mesure de la hauteur [SI].",
  },
  {
    session: "2025",
    chapitre: "Algèbre",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.5] Soit P le polynôme défini par : P(x) = 9x² - 6x + 1 + (3+5x)(4-12x). Écrire P(x) sous forme d'un produit de facteurs du premier degré.",
  },
  {
    session: "2025",
    chapitre: "Géométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.6] Calculer la mesure de l'angle inscrit CBD sachant que son angle au centre associé mesure 110°.",
  },
  {
    session: "2025",
    chapitre: "Géométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 1, II.7] Soient les vecteurs u(-a+1 ; 1) et v(3 ; b-6). Déterminer les réels a et b pour que les vecteurs u et v soient égaux.",
  },
  {
    session: "2025",
    chapitre: "Géométrie",
    content:
      "[BEPC 2025, 1er tour — Partie 2, Exercice 1] Dans le plan muni d'un repère orthonormé (O, i, j), on considère les points A(3;4), B(3;0) et C(1;4). (Unité graphique 1 cm)\n1) a) Placer les points A, B et C dans le repère.\n   b) Calculer les distances AB et AC.\n   c) Montrer que les vecteurs AB et AC sont orthogonaux.\n   d) En déduire la nature du triangle ABC.\n2) Soit (C) le cercle circonscrit au triangle ABC.\n   a) Déterminer les coordonnées du centre I du cercle (C).\n   b) Calculer le rayon r du cercle (C).\n   c) Construire le cercle (C) dans le même repère.",
  },
  {
    session: "2025",
    chapitre: "Fonctions",
    content:
      "[BEPC 2025, 1er tour — Partie 2, Exercice 2] On considère l'application f définie par : f(x) = |(1/2)x| + |-(1/2)x + 2|.\n1) Montrer que f(x) = -x+2 si x∈]-∞;0], 2 si x∈[0;4], x-2 si x∈[4;+∞[.\n2) Déterminer le sens de variation de f sur chacun des intervalles ]-∞;0] et [4;+∞[.\n3) Calculer f(-2), f(0), f(4) et f(5).\n4) Représenter graphiquement f dans un repère orthonormé (O,i,j). Unité graphique : 1cm.",
  },

  // ── Session 2013 (1er tour) ────────────────────────────────────────────────
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q1] Écrire seulement la ou les lettres du ou des couples qui vérifient l'inéquation suivante : 2x + 3y > 6\na. (1 ; 2) ; b. (2 ; 0) ; c. (0 ; 2) ; d. (2 ; 1)",
  },
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q2] Soit f le polynôme tel que f(x) = 3x² + 2x√3 + 1. Factoriser f(x) en utilisant l'identité remarquable qui convient.",
  },
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q3] Soit g le polynôme tel que g(x) = (x-1)² + 3(x+3)(x-1) - (x-2)(x-1). Factoriser g(x).",
  },
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q4] Dans un repère orthonormé (O, i, j) du plan, résoudre graphiquement dans IR × IR le système suivant : (E) { 2x + y = 5 ; x - 3y = 6 }",
  },
  {
    session: "2013",
    chapitre: "Fonctions",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q5] Soit h une application affine telle que : h(x) = (1 - √2)x + 5/3. Donner le sens de variation de h.",
  },
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q6] Soient a et b deux réels tels que a = 3√5 et b = 2√11. Comparer a et b.",
  },
  {
    session: "2013",
    chapitre: "Trigonométrie",
    content:
      "[BEPC 2013, 1er tour — Partie 1, Q7] Soit ABC un triangle rectangle en B tel que AB = 6, BC = 8, AC = 10. Sans faire de figure :\na) Calculer le sinus de l'angle BAC.\nb) Trouver la mesure de l'angle BAC à un degré près (par excès), sachant que sin(52°)=0,7880, sin(53°)=0,7986, sin(54°)=0,8090, sin(55°)=0,8192, sin(56°)=0,8290.",
  },
  {
    session: "2013",
    chapitre: "Géométrie",
    content:
      "[BEPC 2013, 1er tour — Partie 2, I] Soit la figure suivante (le candidat ne reproduira pas la figure) : un cercle de centre O passant par les points A, B, C, E, F, avec OE = 4 et OEF un triangle équilatéral.\n1) Trouver, en justifiant, la mesure de l'angle ECF et celle de l'angle BFC.\n2) Montrer que ABC est un triangle rectangle (préciser le sommet de l'angle droit).\n3) Justifier que la longueur du segment [AC] est égale à 4√3, sachant que sin30°=1/2, cos30°=√3/2, tan30°=√3/3.\n4) Déterminer la longueur du segment [BC].",
  },
  {
    session: "2013",
    chapitre: "Algèbre",
    content:
      "[BEPC 2013, 1er tour — Partie 2, II] À l'occasion du succès de son fils à l'examen du BEPC, un père veut organiser une fête. Il décide d'acheter des poulets et des pintades. Il souhaite avoir plus de 12 volailles.\n1) En désignant par x le nombre de pintades et y celui des poulets, traduire cette situation par une inéquation.\n2) Le père voudrait dépenser moins de 45000F pour l'achat des volailles. Sachant qu'une pintade coûte 2500F et un poulet 3000F, trouver une inéquation qui traduit cette situation.\n3) a) Montrer que l'on obtient le système : { x + y > 12 ; 5x + 6y < 90 }\n   b) Combien de poulets le père peut-il obtenir s'il veut 6 pintades ? Donner toutes les possibilités.",
  },
];

module.exports = { CORPUS };
