// ===================================================================
// Configuration Firebase — Ludotheracoach
// ===================================================================
// 1. Va sur https://console.firebase.google.com
// 2. Crée un nouveau projet, par ex. "ludotheracoach"
// 3. Active "Authentication" > méthode "E-mail/mot de passe"
// 4. Active "Firestore Database" (mode production)
// 5. Dans "Paramètres du projet" > "Vos applications" > Web (</>),
//    copie la config qui ressemble à l'objet ci-dessous et colle-la ici.
// ===================================================================

const firebaseConfig = {
  apiKey: "REMPLACER_MOI",
  authDomain: "REMPLACER_MOI.firebaseapp.com",
  projectId: "REMPLACER_MOI",
  storageBucket: "REMPLACER_MOI.appspot.com",
  messagingSenderId: "REMPLACER_MOI",
  appId: "REMPLACER_MOI"
};

// Numéro de version affiché en mode Super user, pour vérifier
// facilement que la dernière version est bien déployée.
const SITE_VERSION = "Isabelle V06";
