// ===================================================================
// auth.js — connexion, déconnexion, contrôle de rôle, mot de passe oublié
// Utilise Firebase Authentication + Firestore (collection "users")
// Chaque doc "users/{uid}" doit contenir : { nom, email, role }
// role attendu : "superuser" | "admin" | "membre"
// ===================================================================

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ROLE_PAGES = {
  superuser: "superuser.html",
  admin: "admin.html",
  membre: "membre.html"
};

function showMsg(el, text, type){
  el.textContent = text;
  el.className = "auth-msg " + type;
}

// ---------- page de connexion ----------
function initLoginPage(){
  const form = document.getElementById("login-form");
  const msg = document.getElementById("login-msg");
  const resetLink = document.getElementById("reset-link");

  if(form){
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      msg.className = "auth-msg";
      try{
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const doc = await db.collection("users").doc(cred.user.uid).get();
        if(!doc.exists){
          showMsg(msg, "Compte connecté mais aucun rôle associé. Contacte le super user.", "error");
          return;
        }
        const role = doc.data().role;
        const target = ROLE_PAGES[role];
        if(!target){
          showMsg(msg, "Rôle inconnu : " + role, "error");
          return;
        }
        window.location.href = target;
      }catch(err){
        showMsg(msg, "Identifiant ou mot de passe incorrect.", "error");
      }
    });
  }

  if(resetLink){
    resetLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      if(!email){
        showMsg(msg, "Indique ton e-mail ci-dessus puis clique à nouveau sur ce lien.", "error");
        return;
      }
      try{
        await auth.sendPasswordResetEmail(email);
        showMsg(msg, "E-mail de réinitialisation envoyé à " + email + ".", "ok");
      }catch(err){
        showMsg(msg, "Impossible d'envoyer l'e-mail : " + err.message, "error");
      }
    });
  }
}

// ---------- protection des tableaux de bord ----------
// À appeler en haut de chaque page privée : guardRole("admin")
function guardRole(expectedRole){
  auth.onAuthStateChanged(async (user) => {
    if(!user){
      window.location.href = "login.html";
      return;
    }
    const doc = await db.collection("users").doc(user.uid).get();
    const role = doc.exists ? doc.data().role : null;

    if(role !== expectedRole){
      // le super user peut aussi consulter les autres espaces pour vérification
      if(role === "superuser" && expectedRole !== "superuser"){
        // autorisé en lecture, badge adapté géré par la page elle-même
      } else {
        window.location.href = "login.html";
        return;
      }
    }
    document.querySelectorAll("[data-user-name]").forEach(el => {
      el.textContent = doc.exists ? (doc.data().nom || user.email) : user.email;
    });
    document.querySelectorAll("[data-user-role]").forEach(el => {
      el.textContent = role;
      el.className = el.className.replace(/\b(super|admin|membre)\b/g, "") + " " + (role === "superuser" ? "super" : role);
    });
  });
}

function logoutUser(){
  auth.signOut().then(() => window.location.href = "login.html");
}
