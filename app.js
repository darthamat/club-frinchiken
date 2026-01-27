import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// ---------------- ELEMENTOS DOM ----------------
const btnLoginPage = document.getElementById("btnLoginPage");
const btnRegisterPage = document.getElementById("btnRegisterPage");
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const portada = document.getElementById("portada");
const feedLogros = document.getElementById("feedLogros");

// ---------------- BOTONES HEADER ----------------
btnLoginPage.addEventListener("click", () => {
  window.location.href = "login.html"; // Página de login con Google / Email
});

btnRegisterPage.addEventListener("click", () => {
  window.location.href = "register.html"; // Página de registro de cuenta
});

// ---------------- CARGAR RETO ACTUAL ----------------
async function cargarRetoActual(){
  try{
    const retoRef = doc(db,"retos","2026_01");
    const snap = await getDoc(retoRef);
    if(snap.exists()){
      const reto = snap.data();
      titulo.textContent = reto.Titulo || "Título desconocido";
      autor.textContent = "Autor: " + (reto.Autor || "Desconocido");
      portada.src = reto.portadaUrl || "";
    } else {
      titulo.textContent = "No hay reto activo";
      autor.textContent = "";
      portada.src = "";
    }
  }catch(e){
    console.error(e);
    titulo.textContent = "Error al cargar el reto";
    autor.textContent = "";
    portada.src = "";
  }
}
cargarRetoActual();

// ---------------- LOGROS ALEATORIOS ----------------
// Este código es solo de ejemplo, puedes adaptarlo a tu estructura de Firestore
async function cargarLogrosFeed(){
  feedLogros.innerHTML = "<p>Cargando logros...</p>";
  // Aquí puedes leer los logros de los usuarios y mostrarlos
}
cargarLogrosFeed();
setInterval(cargarLogrosFeed,3000);
