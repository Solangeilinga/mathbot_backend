// scripts/insertTestSubject.js — Insérer un sujet BEPC 2025 de test dans PostgreSQL
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

const sujetBEPC2025 = `EXAMEN D'ÉTAT - SESSION 2025
BEPC - RÉPUBLIQUE DU BURKINA FASO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUJET DE MATHÉMATIQUES
Durée : 2 heures
Coefficient : 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS GÉNÉRALES :
- L'usage de la calculatrice est autorisé
- Les figures ne sont pas à l'échelle
- Toute solution doit être justifiée
- Les brouillons ne seront pas corrigés

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCICE 1 : ALGÈBRE (5 points)

1.1) Résoudre l'équation : 2x + 5 = 13
     a) x = 3
     b) x = 4
     c) x = 5
     d) x = 6

1.2) Développer et simplifier : (x + 3)² - (x - 1)²
     a) 8x + 8
     b) 8x + 10
     c) 6x + 8
     d) 4x + 10

1.3) Factoriser : 4x² - 9
     a) (2x - 3)²
     b) (2x + 3)(2x - 3)
     c) (2x - 3)(2x + 3)
     d) 2(2x - 4.5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCICE 2 : GÉOMÉTRIE (5 points)

On considère un triangle ABC rectangle en A.
On donne : AB = 3 cm, AC = 4 cm

2.1) Calculer BC en utilisant le théorème de Pythagore
     a) 5 cm
     b) 6 cm
     c) 7 cm
     d) 12 cm

2.2) L'aire du triangle ABC est :
     a) 6 cm²
     b) 7 cm²
     c) 12 cm²
     d) 12.5 cm²

2.3) Un cercle de rayon 2.5 cm et de centre B a pour aire :
     (on prendra π ≈ 3.14)
     a) 7.85 cm²
     b) 15.7 cm²
     c) 19.625 cm²
     d) 31.4 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCICE 3 : STATISTIQUES ET PROBABILITÉS (5 points)

Lors d'une élection dans un établissement, on recense :
- 45% d'élèves du cycle d'adaptation
- 35% d'élèves du 1er cycle
- 20% d'élèves du 2ème cycle

3.1) Si l'établissement compte 1000 élèves, combien d'élèves sont du 1er cycle ?
     a) 200 élèves
     b) 300 élèves
     c) 350 élèves
     d) 450 élèves

3.2) La probabilité de choisir un élève du 2ème cycle au hasard est :
     a) 0.20
     b) 0.35
     c) 0.45
     d) 0.80

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCICE 4 : PROBLÈME - LES CULTURES AU BURKINA FASO (5 points)

Dans un village du Burkina Faso, un agriculteur cultive du mil et du sorgho.
- Il a récolté 250 kg de mil et 180 kg de sorgho cette année
- Le prix du mil est 800 CFA/kg
- Le prix du sorgho est 600 CFA/kg

4.1) Combien de CFA l'agriculteur a-t-il reçu pour la vente du mil ?
     a) 150 000 CFA
     b) 180 000 CFA
     c) 200 000 CFA
     d) 250 000 CFA

4.2) Quel est le revenu total (mil + sorgho) ?
     a) 108 000 CFA
     b) 200 000 CFA
     c) 308 000 CFA
     d) 400 000 CFA

4.3) Si l'agriculteur veut acheter une charrette à 150 000 CFA, combien lui restera-t-il après cet achat ?
     a) 58 000 CFA
     b) 108 000 CFA
     c) 158 000 CFA
     d) 308 000 CFA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIN DU SUJET
`;

async function insertTestSubject() {
  try {
    console.log("📝 Insertion du sujet BEPC 2025...");

    await pool.query(
      `INSERT INTO exam_subjects (session, chapitre, sujet)
       VALUES ($1, $2, $3)
       ON CONFLICT (session, chapitre) DO UPDATE SET sujet = EXCLUDED.sujet`,
      ["2025", "Mixte", sujetBEPC2025]
    );

    console.log("✅ Sujet BEPC 2025 inséré avec succès !");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

insertTestSubject();
