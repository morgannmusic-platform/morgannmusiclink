import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMoFF5b09eiSeQQ_BhSbclmGj3S6zAGXE",
  authDomain: "morgann-music-ai.firebaseapp.com",
  projectId: "morgann-music-ai",
  storageBucket: "morgann-music-ai.firebasestorage.app",
  messagingSenderId: "817825197478",
  appId: "1:817825197478:web:05f7a630b27b1fe8f17367",
  measurementId: "G-0Q8PTSJTY0"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

let firestoreToolsPromise;

async function getFirestoreTools() {
  if (!firestoreToolsPromise) {
    firestoreToolsPromise = import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
      .then((mod) => ({
        db: mod.getFirestore(app),
        doc: mod.doc,
        getDoc: mod.getDoc,
        setDoc: mod.setDoc,
        serverTimestamp: mod.serverTimestamp
      }));
  }

  return firestoreToolsPromise;
}

export async function saveUserProfile(uid, payload) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreTools();
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      ...payload,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getUserProfile(uid) {
  const { db, doc, getDoc } = await getFirestoreTools();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export { onAuthStateChanged, signOut };
