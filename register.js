import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// ---------------- ELEMENTOS ----------------
const registrarBtn = document.getElementById("registrarBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registroError = document.getElementById("registroError");
const registroExito = document.getElementById("registroExito");

// ---------------- CLASES ALEATORIAS ----------------
const clasesRPG = [
  "Mago Enteraíllo", "Bardo Cuentacuentos", "Caballero de las Palabras",
  "Pícaro de los Post-it", "Druida de Marcapáginas", "Arquitecto de Tramas",
  "Explorador de Bibliotecas", "Alquimista de Historias", "Guardabibliotecas",
  "Oráculo de Sinopsis", "Hechicero de Títulos Largos", "Viajero de Mundos Paralelos",
  "Señor/a de las Comillas", "Monje de los Ensayos", "Ninja de las Notas al Pie",
  "Gladiador de las Páginas", "Cazador de Spoilers", "Pirata de Bibliotecas",
  "Arquero de la Lectura", "Alquimista de Café y Libros"
];

// Función para elegir una clase aleatoria
function claseAleatoria() {
  return clasesRPG[Math.floor(Math.random() * clasesRPG.length)];
}


// ---------------- REGISTRO ----------------
registrarBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  registroError.textContent = "";
  registroExito.textContent = "";

  if(!email || !password){
    registroError.textContent = "Completa todos los campos";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Asignar clase aleatoria
    const clase = claseAleatoria();

    // Crear documento en Firestore
    await setDoc(doc(db,"users",user.uid),{
      displayName: email,
      prestigio: 0,
      nivel: 1,
      clase: clase,
      photoURL: "",
      lecturas: []
    });

    registroExito.textContent = `Usuario registrado! Tu clase es: ${clase}`;
    emailInput.value = "";
    passwordInput.value = "";
  } catch (error) {
    registroError.textContent = error.message;
  }
});

