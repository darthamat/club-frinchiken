import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ---------------- FIREBASE ----------------
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

// ---------------- DOM ----------------
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const claseEl = document.getElementById("clasePersonaje");
const nivelEl = document.getElementById("nivelUsuario");

// búsqueda
const inputBusqueda = document.getElementById("busquedaLibro");
const btnBuscar = document.getElementById("btnBuscar");
const resultadosEl = document.getElementById("resultados");

// registrar lectura
const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");

// campos libro
const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaSelect = document.getElementById("categoria");

let usuarioActual = null;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioActual = user;
  cargarPerfilUsuario();
  cargarRetoActual();
});

// ---------------- PERFIL USUARIO ----------------
async function cargarPerfilUsuario() {
  const ref = doc(db, "users", usuarioActual.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();
  nombrePersonajeEl.textContent = data.nombrePersonaje || "Sin nombre";
  claseEl.textContent = data.clase || "Aventurero";
  nivelEl.textContent = data.nivel || 1;
}

// ---------------- RETO ACTUAL ----------------
async function cargarRetoActual() {
  const ref = doc(db, "retos", "2026_01");
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const reto = snap.data();

  btnReto.onclick = () => {
    tituloInput.value = reto.Titulo;
    autorInput.value = reto.Autor;
    paginasInput.value = reto.paginas || "";
    categoriaSelect.value = reto.categoria || "Fantasía";
  };
}

// ---------------- BUSCAR LIBROS (Google Books) ----------------
btnBuscar.addEventListener("click", buscarLibros);

async function buscarLibros() {
  const q = inputBusqueda.value.trim();
  if (!q) return;

  resultadosEl.innerHTML = "";
  resultadosEl.classList.remove("hidden");

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`
  );
  const data = await res.json();

  if (!data.items) {
    resultadosEl.innerHTML = "<li>No se encontraron libros</li>";
    return;
  }

  data.items.slice(0, 5).forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.textContent = `${info.title} — ${info.authors?.[0] || "Autor desconocido"}`;

    li.onclick = () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || "";
      resultadosEl.classList.add("hidden");
    };

    resultadosEl.appendChild(li);
  });
}

// ---------------- REGISTRAR LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  const lectura = {
    titulo: tituloInput.value,
    autor: autorInput.value,
    paginas: Number(paginasInput.value),
    categoria: categoriaSelect.value,
    progreso: 0,
    activa: true,
    fechaInicio: new Date()
  };

  if (!lectura.titulo) {
    alert("Falta el título");
    return;
  }

  await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  alert("📘 Lectura registrada");
});
