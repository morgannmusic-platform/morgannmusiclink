import { auth, googleProvider, saveUserProfile, getUserProfile } from "./firebase-app.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginGoogleBtn = document.getElementById("login-google-btn");
const registerGoogleBtn = document.getElementById("register-google-btn");
const messageBox = document.getElementById("auth-message");
const tabButtons = document.querySelectorAll(".auth-tab");
const panels = document.querySelectorAll(".auth-panel");

function getAuthErrorMessage(error) {
  const code = error?.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Cet email est déjà utilisé.";
    case "auth/invalid-email":
      return "L'adresse email est invalide.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible (6 caractères minimum).";
    case "auth/invalid-credential":
      return "Email ou mot de passe invalide.";
    case "auth/operation-not-allowed":
      return "Cette méthode de connexion n'est pas activée.";
    case "auth/popup-closed-by-user":
      return "La fenêtre Google a été fermée.";
    case "auth/unauthorized-domain":
      return "Domaine non autorisé. Ajoute ce domaine dans les paramètres d'authentification.";
    case "auth/network-request-failed":
      return "Erreur réseau, réessaie dans un instant.";
    default:
      return error?.message || "Une erreur est survenue.";
  }
}

function setMessage(text, isError = false) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.classList.toggle("error", isError);
}

function splitDisplayName(displayName = "") {
  const parts = displayName.trim().split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return {
      prenom: parts[0] || "",
      nom: ""
    };
  }

  return {
    prenom: parts[0],
    nom: parts.slice(1).join(" ")
  };
}

function activateTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });

  setMessage("");

  if (tabName === "inscription") {
    window.location.hash = "inscription";
  } else {
    history.replaceState(null, "", window.location.pathname);
  }
}

async function saveGoogleUserIfNeeded(user) {
  let existing = null;

  try {
    existing = await getUserProfile(user.uid);
  } catch {
    return;
  }

  if (existing) return;

  const { prenom, nom } = splitDisplayName(user.displayName || "");
  try {
    await saveUserProfile(user.uid, {
      nom,
      prenom,
      pays: "Non renseigné",
      email: user.email || ""
    });
  } catch {
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

if (loginGoogleBtn) {
  loginGoogleBtn.addEventListener("click", async () => {
    try {
      setMessage("Connexion Google en cours...");
      const result = await signInWithPopup(auth, googleProvider);
      await saveGoogleUserIfNeeded(result.user);
      window.location.href = "index.html";
    } catch (error) {
      setMessage(getAuthErrorMessage(error), true);
    }
  });
}

if (registerGoogleBtn) {
  registerGoogleBtn.addEventListener("click", async () => {
    try {
      setMessage("Inscription Google en cours...");
      const result = await signInWithPopup(auth, googleProvider);
      await saveGoogleUserIfNeeded(result.user);
      window.location.href = "index.html";
    } catch (error) {
      setMessage(getAuthErrorMessage(error), true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      setMessage("Connexion en cours...");
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      setMessage(getAuthErrorMessage(error), true);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const prenomField = document.getElementById("register-prenom");
    const nomField = document.getElementById("register-nom");
    const paysField = document.getElementById("register-pays");
    const emailField = document.getElementById("register-email");
    const passwordField = document.getElementById("register-password");

    const prenom = prenomField?.value.trim() || "";
    const nom = nomField?.value.trim() || "";
    const pays = paysField?.value || "";
    const email = emailField?.value.trim() || "";
    const password = passwordField?.value || "";

    if (!prenom || !nom || !pays) {
      setMessage("Nom, prénom et pays sont obligatoires.", true);
      return;
    }

    if (!email) {
      setMessage("L'email est obligatoire.", true);
      return;
    }

    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.", true);
      return;
    }

    try {
      setMessage("Inscription en cours...");
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(credential.user, {
        displayName: `${prenom} ${nom}`
      });

      try {
        await saveUserProfile(credential.user.uid, {
          nom,
          prenom,
          pays,
          email
        });
      } catch {
      }

      window.location.href = "index.html";
    } catch (error) {
      setMessage(getAuthErrorMessage(error), true);
    }
  });
}

activateTab(window.location.hash === "#inscription" ? "inscription" : "connexion");
