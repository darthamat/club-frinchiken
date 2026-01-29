import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
  authDomain: "club-frinchiken.firebaseapp.com",
  projectId: "club-frinchiken",
  storageBucket: "club-frinchiken.firebasestorage.app",
  messagingSenderId: "993321884320",
  appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// ELEMENTOS
const loginBtn = document.getElementById("loginBtn");
const btnGoogle = document.getElementById("btnGoogle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// LOGIN EMAIL
loginBtn.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  loginError.textContent = "";
try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await initUsuario(cred.user.uid);
    window.location.href = "lector.html";
  } catch (e) {
    loginError.textContent = e.message;
  }
});

  
async function initUsuario(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data(); // usuario ya existe
  }

  const nuevoUsuario = {
    perfil: {
      nombreReal: "",
      nombrePersonaje: "Lector/a Errante y Sin nombre",
      clase: "Lector/a Sin Clase",
      avatarUrl: "",
      nivel: 1,
      xp: 0,
      xpNecesaria: 100,
      prestigio: 0
    },
    stats: {
      fuerza: 10,
      agilidad: 10,
      inteligencia: 10,
      sabiduria: 10,
      mente: 0,
      corazon: 0,
      fatiga: 0
    },
    lecturas: {
      activas: [],
      terminadas: []
    },
    retos: {
      actual: null,
      completados: []
    },
    logros: [],
    economia: {
      oro: 0,
      botines: []
    },
    config: {
      tema: "claro",
      mostrarTerminadas: false
    },
    meta: {
      fechaRegistro: new Date().toISOString(),
      ultimaConexion: new Date().toISOString()
    }
  };

  await setDoc(userRef, nuevoUsuario);
  return nuevoUsuario;
}

