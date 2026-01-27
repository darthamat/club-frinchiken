import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, Timestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ---------------- CONFIG FIREBASE ----------------
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

// ---------------- ELEMENTOS DOM ----------------
const btnAcceder = document.getElementById("btnAcceder");
const btnLogout = document.getElementById("btnLogout");
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const registrarBtn = document.getElementById("registrarBtn");
const btnGoogle = document.getElementById("btnGoogle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// Datos de lectura
const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaImg = document.querySelector(".portada");

// ---------------- POPUP LOGIN ----------------
// Abrir modal
btnAcceder.addEventListener("click", () => loginModal.classList.remove("hidden"));

// Cerrar modal al hacer click fuera del contenido
loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
});

// ---------------- LOGIN / REGISTRO ----------------
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    loginError.textContent = "";
    loginModal.classList.add("hidden");
  } catch (error) {
    loginError.textContent = error.message;
  }
});

registrarBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Crear doc usuario en Firestore
    await setDoc(doc(db,"users",cred.user.uid),{
      displayName: email,
      prestigio: 0,
      nivel: 1,
      photoURL: ""
    });
    loginError.textContent = "";
    loginModal.classList.add("hidden");
  } catch (error) {
    loginError.textContent = error.message;
  }
});

btnGoogle.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);
    if(!snap.exists()){
      await setDoc(userRef,{ displayName:user.displayName, prestigio:0, nivel:1, photoURL:user.photoURL||"" });
    }
    loginModal.classList.add("hidden");
  } catch(e){
    alert(e.message);
  }
});

// ---------------- LOGOUT ----------------
btnLogout.addEventListener("click", async()=>await signOut(auth));

// ---------------- DETECTAR SESION ----------------
onAuthStateChanged(auth, async (user)=>{
  if(user){
    btnAcceder.classList.add("hidden");
    btnLogout.classList.remove("hidden");
    // Aquí puedes mostrar info usuario si quieres
  } else {
    btnAcceder.classList.remove("hidden");
    btnLogout.classList.add("hidden");
  }
});


