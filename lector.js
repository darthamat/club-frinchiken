import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, addDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
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

const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");
const btnBuscar = document.getElementById("btnBuscar");

const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");

let usuarioActual = null;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioActual = user;
  cargarPerfilUsuario();
});

const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- PERFIL ----------------
async function cargarPerfilUsuario() {
  const ref = doc(db, "users", usuarioActual.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const u = snap.data();
  nombrePersonajeEl.textContent = u.nombrePersonaje || "Sin nombre";
  claseEl.textContent = u.clase || "Aventurero";
  nivelEl.textContent = u.nivel || 1;
}

// ---------------- BOTÓN RETO ----------------
btnReto.addEventListener("click", async () => {
  const ref = doc(db, "retos", "2026_01");
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const r = snap.data();
  tituloInput.value = r.Titulo || "";
  autorInput.value = r.Autor || "";
  paginasInput.value = r.paginas || "";
  categoriaInput.value = r.categoria || "Fantasía";
});

// ---------------- BUSCADOR LIBROS ----------------
btnBuscar.addEventListener("click", async () => {
  const q = busquedaLibro.value.trim();
  if (q.length < 3) return;

  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&langRestrict=es&maxResults=8`
    );

    const data = await res.json();

    if (!data.items) {
      resultados.innerHTML = "<li>No se encontraron libros</li>";
      return;
    }

    data.items.forEach(libro => {
      const info = libro.volumeInfo;
      const li = document.createElement("li");

      li.textContent = `${info.title} — ${info.authors?.[0] || "Autor desconocido"}`;

      li.addEventListener("click", () => {
        tituloInput.value = info.title || "";
        autorInput.value = info.authors?.[0] || "";
        paginasInput.value = info.pageCount || "";
        resultados.classList.add("hidden");
      });

      resultados.appendChild(li);
    });

  } catch (e) {
    console.error(e);
    resultados.innerHTML = "<li>Error al buscar libros</li>";
  }
});

// ---------------- REGISTRAR LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!tituloInput.value) {
    alert("Falta el título");
    return;
  }

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value),
    categoria: categoriaInput.value,
    progreso: 0,
    activa: true,
    fechaInicio: Timestamp.now()
  };

  await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  alert("📘 Lectura registrada");
});

