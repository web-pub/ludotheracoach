// ===================================================================
// auth.js — connexion, déconnexion, contrôle de rôle, mot de passe oublié
// Utilise Firebase Authentication + Firestore (collections "users" et "identifiants")
// Chaque doc "users/{uid}" doit contenir : { nom, email, role, identifiant }
// Chaque doc "identifiants/{identifiant-en-minuscule}" doit contenir : { email }
// role attendu : "superuser" | "admin" | "membre"
// La connexion se fait par IDENTIFIANT (ex. "HeleneL"), pas par e-mail :
// on retrouve l'e-mail technique associé, puis on se connecte avec Firebase Auth.
// ===================================================================

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ROLE_PAGES = {
  superuser: "superuser.html",
  admin: "admin.html",
  membre: "membre.html"
};

const ROLE_LABELS = {
  superuser: "Super user",
  admin: "Admin",
  membre: "Membre"
};

function showMsg(el, text, type){
  el.textContent = text;
  el.className = "auth-msg " + type;
}

async function emailDepuisIdentifiant(identifiant){
  const cle = identifiant.trim().toLowerCase();
  const doc = await db.collection("identifiants").doc(cle).get();
  if(!doc.exists) throw new Error("Identifiant inconnu.");
  return doc.data().email;
}

// ---------- page de connexion ----------
function initLoginPage(){
  const form = document.getElementById("login-form");
  const msg = document.getElementById("login-msg");
  const resetLink = document.getElementById("reset-link");

  const params = new URLSearchParams(location.search);
  if(params.get("archive") === "1"){
    showMsg(msg, "Ce compte a été archivé. Contacte Isabelle ou le super user.", "error");
  }

  if(form){
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifiant = document.getElementById("login-identifiant").value.trim();
      const password = document.getElementById("login-password").value;
      msg.className = "auth-msg";
      try{
        const email = await emailDepuisIdentifiant(identifiant);
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const doc = await db.collection("users").doc(cred.user.uid).get();
        if(!doc.exists){
          showMsg(msg, "Compte connecté mais aucun rôle associé. Contacte le super user.", "error");
          return;
        }
        if(doc.data().role === "membre" && doc.data().actif === false){
          await auth.signOut();
          showMsg(msg, "Ce compte a été archivé. Contacte Isabelle ou le super user.", "error");
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
      const identifiant = document.getElementById("login-identifiant").value.trim();
      if(!identifiant){
        showMsg(msg, "Indique ton identifiant ci-dessus puis clique à nouveau sur ce lien.", "error");
        return;
      }
      try{
        const email = await emailDepuisIdentifiant(identifiant);
        await auth.sendPasswordResetEmail(email);
        showMsg(msg, "E-mail de réinitialisation envoyé.", "ok");
      }catch(err){
        showMsg(msg, "Impossible d'envoyer le lien : " + err.message, "error");
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

    if(role === "membre" && doc.data().actif === false){
      await auth.signOut();
      window.location.href = "login.html?archive=1";
      return;
    }

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
      el.textContent = ROLE_LABELS[role] || role;
      el.className = el.className.replace(/\b(super|admin|membre)\b/g, "") + " " + (role === "superuser" ? "super" : role);
    });
    enregistrerDerniereConnexion(user.uid);
  });
}

function logoutUser(){
  auth.signOut().then(() => window.location.href = "login.html");
}

function enregistrerDerniereConnexion(uid){
  db.collection("users").doc(uid).update({ derniereConnexion: new Date().toISOString() })
    .catch(err => console.error("Impossible d'enregistrer la dernière connexion :", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const current = location.pathname.split("/").pop();
  document.querySelectorAll(".dash-subnav a").forEach(a => {
    if(a.getAttribute("href") === current) a.classList.add("active");
  });
});

// ---------- protection multi-rôles (ex: page accessible à admin ET superuser) ----------
function guardRoles(allowedRoles){
  auth.onAuthStateChanged(async (user) => {
    if(!user){ window.location.href = "login.html"; return; }
    const doc = await db.collection("users").doc(user.uid).get();
    const role = doc.exists ? doc.data().role : null;
    if(role === "membre" && doc.data().actif === false){
      await auth.signOut();
      window.location.href = "login.html?archive=1";
      return;
    }
    if(!allowedRoles.includes(role)){
      window.location.href = "login.html";
      return;
    }
    document.querySelectorAll("[data-user-name]").forEach(el => {
      el.textContent = doc.exists ? (doc.data().nom || user.email) : user.email;
    });
    document.querySelectorAll("[data-user-role]").forEach(el => {
      el.textContent = ROLE_LABELS[role] || role;
      el.className = el.className.replace(/\b(super|admin|membre)\b/g, "") + " " + (role === "superuser" ? "super" : role);
    });
    enregistrerDerniereConnexion(user.uid);
  });
}
