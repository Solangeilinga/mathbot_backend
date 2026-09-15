// data/annales-corpus.js — Corpus RAG : vraies annales BEPC Burkina Faso, sourcées
// du Ministère (épreuves officielles, référence MESPFT/SG/DGECC), transcrites depuis
// les sujets originaux et étiquetées PAR EXERCICE (et non par document entier) —
// contrairement à l'ancien pipeline qui taguait tout un sujet "Mixte".
//
// Sources : examens-concours.net (2025, 2021, 2013) et epreuvesetcorriges.com
// (2023, 2022) — voir scripts/insertRealSubjects.js pour le détail par session.
// Sessions couvertes : 2025, 2023, 2022, 2021, 2013 (toutes 1er tour).
//
// ⚠️ Limite connue et assumée : aucune des 5 sessions récupérées ne contient de
// question de Probabilités — ce chapitre n'a donc pas d'annale réelle indexée
// pour l'instant. Mieux vaut l'absence de couverture que d'y insérer un exercice
// inventé étiqueté comme "vraie annale". Pas de session 2020 trouvée non plus
// (voir scripts/insertRealSubjects.js).

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

  // ── Session 2023 (1er tour) — MENAPLN/SG/DGEC_2023 ────────────────────────
  {
    session: "2023",
    chapitre: "Fonctions",
    content:
      "[BEPC 2023, 1er tour — Partie 1, I.1] Laquelle des expressions suivantes est celle d'une application linéaire ?\na) -3/4 x + y - 1\nb) -5x²\nc) x/2 + x\nd) -5x",
  },
  {
    session: "2023",
    chapitre: "Fonctions",
    content:
      "[BEPC 2023, 1er tour — Partie 1, I.2] Soit (D) la droite d'équation : 2x - 1/3 y - 3 = 0. Quel est le coefficient directeur de la droite (D) ?\na) 1/3\nb) 2\nc) 6\nd) 1/6",
  },
  {
    session: "2023",
    chapitre: "Algèbre",
    content:
      "[BEPC 2023, 1er tour — Partie 1, I.3] Quelle est la distance entre les réels 11 et -3 ?\na) 11\nb) 14\nc) 11/3\nd) -3/11",
  },
  {
    session: "2023",
    chapitre: "Algèbre",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.1] Rendre rationnel le dénominateur de l'expression suivante : F = -2/(2+√3)",
  },
  {
    session: "2023",
    chapitre: "Algèbre",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.2] Résoudre dans R × R le système (E) : { 3x + y - 5 = 0 ; x - 2y + 3 = 0 }",
  },
  {
    session: "2023",
    chapitre: "Algèbre",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.3] Factoriser le polynôme suivant : t(x) = (x-2)(2x-3) - (x+1)(2-x)",
  },
  {
    session: "2023",
    chapitre: "Fonctions",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.4] Soit q la fonction rationnelle définie par q(x) = 2x / (x + 1/2). Déterminer l'ensemble de définition de q noté Dq.",
  },
  {
    session: "2023",
    chapitre: "Géométrie",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.5] Dans un repère cartésien (O, i, j) on donne M(-3;5) et P(-5/2;7). Calculer les coordonnées du vecteur MP.",
  },
  {
    session: "2023",
    chapitre: "Géométrie",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.6] ABC est un triangle rectangle en A tel que AB = 4 cm et BC = 5 cm. Calculer le rapport de projection orthogonale k de (BC) sur (AB).",
  },
  {
    session: "2023",
    chapitre: "Fonctions",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.7] Justifier que les droites (D): y = -1/2 x + 3 et (D'): -2x + y - 6 = 0 sont perpendiculaires.",
  },
  {
    session: "2023",
    chapitre: "Géométrie",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.8] On considère la figure ci-contre où (C) est un cercle de centre O et E, F, G et H des points du cercle. On donne l'angle EGH = 27°. Déterminer les valeurs des angles EOH et EFH.",
  },
  {
    session: "2023",
    chapitre: "Géométrie",
    content:
      "[BEPC 2023, 1er tour — Partie 1, II.9] Dans la figure ci-dessous la droite (KN) est parallèle à la droite (LM). Identifier deux triangles qui forment une configuration de Thalès.",
  },
  {
    session: "2023",
    chapitre: "Algèbre",
    content:
      "[BEPC 2023, 1er tour — Partie 2, Exercice 1] Un jardin rectangulaire mesure 10 m de longueur sur 6 m de largeur. On augmente sa longueur puis sa largeur de x mètres (x strictement positif).\n1) Justifier que le périmètre du nouveau jardin est P = 4x + 32. On rappelle P = 2(L + l).\n2) Déterminer l'ensemble des valeurs possibles de x pour lesquelles le périmètre P reste inférieur ou égal à 96 m.",
  },
  {
    session: "2023",
    chapitre: "Géométrie",
    content:
      "[BEPC 2023, 1er tour — Partie 2, Exercice 2] Le plan est muni d'un repère orthonormé (O, i, j) unité graphique 1 cm. On donne les points : A(1;3) ; B(-3;1) et C(0;-5).\n1) a) Calculer les coordonnées des vecteurs AB ; AC et BC.\n   b) En déduire que les droites (AB) et (BC) sont perpendiculaires.\n2) Déterminer une équation cartésienne de la droite (AB).\n3) Soit (Δ) la droite d'équation cartésienne y = -5x + 2 dans un repère du plan. Les points E(a;2) et F(-2;b) appartiennent à la droite (Δ). Déterminer les réels a et b.",
  },

  // ── Session 2022 (1er tour) — MENAPLN/SG/DGEC_2022 ────────────────────────
  {
    session: "2022",
    chapitre: "Fonctions",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.1] Soit f une application affine croissante. Parmi les affirmations suivantes laquelle est vraie ?\na) f(-8) > f(1)\nb) f(5) < f(-7)\nc) f(-5) < f(8)\nd) f(-4) ≥ f(6)",
  },
  {
    session: "2022",
    chapitre: "Géométrie",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.2] Dans le plan muni d'un repère orthonormé (O, i, j), on donne : A(7/2 ; -2) ; B(2 ; -3/2). Quelles sont les coordonnées du vecteur AB ?\na) (3/2 ; 1/2)\nb) (-3/2 ; -1/3)\nc) (-3/2 ; 1/2)\nd) (-3 ; 1)",
  },
  {
    session: "2022",
    chapitre: "Trigonométrie",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.3] BIC est un triangle rectangle en B tel que IC = 6 cm et sin(CÎB) = 1/2. Quelle est la valeur de BC ?\na) 6\nb) 3\nc) 12\nd) 14",
  },
  {
    session: "2022",
    chapitre: "Fonctions",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.4] Laquelle des expressions f(x) suivantes est celle d'une application linéaire ?\na) (√2-1)x + 1\nb) -3x + 3/2\nc) -1/√2 x\nd) 3x²",
  },
  {
    session: "2022",
    chapitre: "Fonctions",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.5] Soit q la fonction rationnelle définie sur R\\{-3} par q(x) = (x - 1/2)/(x + 3). Quelle est l'image par q du réel -1/2 ?\na) 0\nb) -2/5\nc) -4/5\nd) -5/4",
  },
  {
    session: "2022",
    chapitre: "Fonctions",
    content:
      "[BEPC 2022, 1er tour — Partie 1, I.6] Lequel des vecteurs suivants est un vecteur directeur de la droite (D) dont le coefficient directeur est égal à -3/4 ?\na) V(1;-3/4)\nb) V(1/3;1/4)\nc) V(0;-1/4)\nd) V(1/4;1/3)",
  },
  {
    session: "2022",
    chapitre: "Algèbre",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.1] En utilisant l'identité remarquable qui convient, développer le polynôme A = (2√2 - x)².",
  },
  {
    session: "2022",
    chapitre: "Algèbre",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.2] Résoudre dans R × R le système (S) en utilisant la méthode de substitution.\n(S) { 2x - y = -3/2 ; x - 3y = -7 }",
  },
  {
    session: "2022",
    chapitre: "Géométrie",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.3] Dans un repère orthonormé du plan on donne les points A(-1;3) ; B(-4;5) et C(-5/2;4). Montrer que les points A, B et C sont alignés.",
  },
  {
    session: "2022",
    chapitre: "Fonctions",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.4] Déterminer une équation de la droite (D) passant par le point A(3;4) et perpendiculaire à la droite (Δ) d'équation : x + y - 2 = 0.",
  },
  {
    session: "2022",
    chapitre: "Géométrie",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.5] ABC est un triangle rectangle en C de hauteur [CH] tel que AB = 3√2 ; AC = 4 et BC = √2. Calculer la distance CH.",
  },
  {
    session: "2022",
    chapitre: "Géométrie",
    content:
      "[BEPC 2022, 1er tour — Partie 1, II.6] Dans la figure suivante, (C) est cercle de centre O. Les points B, E et M appartiennent à (C). On donne : AOE = 110°. Calculer les mesures des angles AME et OBE.",
  },
  {
    session: "2022",
    chapitre: "Algèbre",
    content:
      "[BEPC 2022, 1er tour — Partie 2, Exercice 1] Jean dispose de x francs. Il dépense la moitié pour son loyer et le tiers pour la scolarité de son fils. La somme de ses dépenses est inférieure ou égale à 50.000 francs et supérieure ou égale à 45.000 francs. Déterminer un encadrement de x.",
  },
  {
    session: "2022",
    chapitre: "Statistiques",
    content:
      "[BEPC 2022, 1er tour — Partie 2, Exercice 2] La série statistique suivante représente les notes obtenues par les élèves d'une classe lors d'une composition.\nNotes : [7;9[ [9;11[ [11;13[ [13;15[ [15;17[ Total\nEffectifs : 9, 15, 22, 16, 2, x\n1) Déterminer x.\n2) Construire l'histogramme de cette série statistique.\n3) Calculer la moyenne de cette série statistique en utilisant les centres de classes.\n4) Calculer le pourcentage d'élèves ayant obtenu une note au moins égale à 11.",
  },

  // ── Session 2021 (1er tour) — Burkina Faso ─────────────────────────────────
  {
    session: "2021",
    chapitre: "Algèbre",
    content:
      "[BEPC 2021, 1er tour — Partie 1, I.1] Parmi les couples de réels suivants, lequel est solution de l'inéquation 2x + 5y - 4 > 0 dans R × R ?\na) (2;-2)\nb) (-2;2)\nc) (-1/2;1)\nd) (0;0)",
  },
  {
    session: "2021",
    chapitre: "Géométrie",
    content:
      "[BEPC 2021, 1er tour — Partie 1, I.2] Dans la figure suivante, le quadrilatère PQFE est un trapèze de bases [PQ] et [EF]. Quels sont les triangles qui forment une configuration de Thalès ?\na) OPE et OFQ\nb) PFQ et PEQ\nc) APF et AQE\nd) OPQ et OFE",
  },
  {
    session: "2021",
    chapitre: "Fonctions",
    content:
      "[BEPC 2021, 1er tour — Partie 1, I.3] Soit f une application linéaire telle que f(-2) = 1/2. Quelle est l'expression f(x) pour tout réel x ?\na) f(x) = 1/2 x\nb) f(x) = -x\nc) f(x) = -2x\nd) f(x) = -1/4 x",
  },
  {
    session: "2021",
    chapitre: "Algèbre",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.1] Factoriser Q(x) = (x-1)² - 5(1-x) en produit de facteurs du premier degré.",
  },
  {
    session: "2021",
    chapitre: "Trigonométrie",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.2] OIT est un triangle rectangle en I tel que IT = 2cm et Tan(TÔI) = 1/2. Calculer OI.",
  },
  {
    session: "2021",
    chapitre: "Algèbre",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.3] Développer (x√2 - 3)(x√2 + 3) en utilisant l'identité remarquable qui convient.",
  },
  {
    session: "2021",
    chapitre: "Statistiques",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.4] L'histogramme suivant représente les fréquences cumulées croissantes d'une série statistique. Quelle est la fréquence cumulée croissante de la classe [10;15[ ?",
  },
  {
    session: "2021",
    chapitre: "Fonctions",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.5] Soit (D) la droite d'équation 2x - 1/3 y + 5 = 0 et E(x;-3) un point de (D). Déterminer l'abscisse x du point E.",
  },
  {
    session: "2021",
    chapitre: "Algèbre",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.6] Utiliser l'identité remarquable qui convient pour factoriser 49x² + 14x + 1.",
  },
  {
    session: "2021",
    chapitre: "Fonctions",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.7] Démontrer que les droites (D): 2x - 3y - 3 = 0 et (D'): -4x + 6y + 1 = 0 sont parallèles.",
  },
  {
    session: "2021",
    chapitre: "Géométrie",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.8] ODE est un triangle tel que OD = 2, DE = 3 et EO = √13. Démontrer que le triangle ODE est un triangle rectangle dont on précisera le sommet de l'angle droit.",
  },
  {
    session: "2021",
    chapitre: "Algèbre",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.9] Résoudre graphiquement le système { x + 3y - 1 = 0 ; -x - y + 3 = 0 } dans R × R.",
  },
  {
    session: "2021",
    chapitre: "Géométrie",
    content:
      "[BEPC 2021, 1er tour — Partie 1, II.10] Dans la figure suivante, ABGFDCHE est un cube d'arête 4 cm. I est le milieu de [FG]. Calculer BI.",
  },
  {
    session: "2021",
    chapitre: "Géométrie",
    content:
      "[BEPC 2021, 1er tour — Partie 2, Exercice 1] Le plan est muni d'un repère orthonormé (O, i, j) d'unité le centimètre.\n1) Placer les points A(-4;1), B(3;0) et C(0;-3).\n2) a) Calculer les distances AB, AC et BC.\n   b) En déduire que le triangle ABC est rectangle en C.\n3) Soit (C) le cercle circonscrit au triangle ABC.\n   a) Déterminer les coordonnées du centre I de (C).\n   b) Déterminer une équation de la tangente (T) au cercle (C) en C.\n   c) Construire (C) et (T) dans le repère (O,i,j).",
  },
  {
    session: "2021",
    chapitre: "Fonctions",
    content:
      "[BEPC 2021, 1er tour — Partie 2, Exercice 2] On considère la fonction rationnelle Q définie par Q(x) = (1-2x)(2-x) / ((1+x)(4x-2)).\n1) Déterminer l'ensemble de définition DQ de Q.\n2) Montrer que Q(x) = (x-2)/(2(x+1)) pour tout réel x de DQ.\n3) a) Calculer Q(√2) et rendre rationnel le dénominateur.\n   b) Donner un encadrement de Q(√2) à 10⁻² près. On donne 1,414 < √2 < 1,415.",
  },
];

module.exports = { CORPUS };
