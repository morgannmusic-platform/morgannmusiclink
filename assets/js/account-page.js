import { auth, onAuthStateChanged, signOut, getUserProfile } from "./firebase-app.js";

const accountBox = document.getElementById("account-box");
const logoutBtn = document.getElementById("logout-btn");

function renderAccount(user, profile) {
  const nom = profile?.nom || "";
  const prenom = profile?.prenom || "";
  const pays = profile?.pays || "Non renseigné";
  const displayName = [prenom, nom].filter(Boolean).join(" ") || "Compte Morgann Music";

  accountBox.innerHTML = `
    <article class="account-card account-card-main">
      <h2>${displayName}</h2>
      <p class="account-subtitle">Vos informations personnelles et de connexion.</p>
      <p><strong>Email :</strong> ${user.email || "-"}</p>
      <p><strong>Pays :</strong> ${pays}</p>
    </article>

    <article class="account-card">
      <h3>Profil</h3>
      <p><strong>Prénom :</strong> ${prenom || "-"}</p>
      <p><strong>Nom :</strong> ${nom || "-"}</p>
    </article>

    <article class="account-card">
      <h3>Sécurité</h3>
      <p><strong>UID :</strong> <span class="uid-value">${user.uid}</span></p>
      <p class="account-muted">Connecté et sécurisé.</p>
    </article>
  `;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "connexion.html";
    return;
  }

  const profile = await getUserProfile(user.uid);
  renderAccount(user, profile);
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "connexion.html";
  });
}
