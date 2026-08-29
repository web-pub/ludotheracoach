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
  apiKey: "AIzaSyCABLCol0iWI1LnO-ZrJW-uZePgFUpAMBQ",
  authDomain: "ludotheracoach.firebaseapp.com",
  projectId: "ludotheracoach",
  storageBucket: "ludotheracoach.firebasestorage.app",
  messagingSenderId: "878493053808",
  appId: "1:878493053808:web:18a57b4dd6143003a2d5b5"
};

// Numéro de version affiché en mode Super user et Admin, pour vérifier
// facilement que la dernière version est bien déployée.
const SITE_VERSION = "Isabelle V17";
