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

const tituloLibro = document.getElementById("titulo");
const autorLibro = document.getElementById("autor");
const paginasLibro = document.getElementById("paginas");
const categoriaLibro = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro"); // este id no estaba en tu HTML


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
  try {
    const retoRef = doc(db, "retos", "2026_01");
    const snap = await getDoc(retoRef);
    if (snap.exists()) {
      const reto = snap.data();
      tituloLibro.value = reto.Titulo || "";
      autorLibro.value = reto.Autor || "";
      paginasLibro.value = reto.Paginas || 0;
      categoriaLibro.value = reto.categoria || "Fantasía";
      portadaLibro.src = reto.portadaUrl || "";
    }
  } catch (e) {
    console.error(e);
  }
});

// ---------------- BUSCADOR LIBROS ----------------
busquedaLibro.addEventListener("input", async () => {
  const texto = busquedaLibro.value.trim();
  if (texto.length < 3) return;

  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`);
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;
    li.addEventListener("click", () => {
      tituloLibro.value = info.title || "";
      autorLibro.value = info.authors?.[0] || "";
      paginasLibro.value = info.pageCount || "";
      categoriaLibro.value = info.categories?.[0] || "Fantasía";
      portadaLibro.src = info.imageLinks?.thumbnail || "";
      resultados.classList.add("hidden");
    });
    resultados.appendChild(li);
  });
});

//nuevas categorias dinamicas
li.addEventListener("click", () => {
  tituloLibro.value = info.title || "";
  autorLibro.value = info.authors?.[0] || "";
  paginasLibro.value = info.pageCount || "";

  // Categoría
  let categoria = info.categories?.[0] || "Fantasía";

  // Si no existe en el select, la añadimos
  if (![...categoriaLibro.options].some(opt => opt.value === categoria)) {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    categoriaLibro.appendChild(option);
  }

  categoriaLibro.value = categoria;

  // Portada
  portadaLibro.src = info.imageLinks?.thumbnail || "";

  resultados.classList.add("hidden");
});


btnRegistrar.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) { alert("Debes iniciar sesión"); return; }

  const lectura = {
    titulo: tituloLibro.value.trim(),
    autor: autorLibro.value.trim(),
    paginas: Number(paginasLibro.value),
    categoria: categoriaLibro.value,
    portada: portadaLibro.src,
    fechaInicio: new Date(),
    estado: "activa"
  };

  try {
    await addDoc(collection(db, "users", user.uid, "lecturas"), lectura);
    alert(`📘 Lectura registrada: ${lectura.titulo}`);
  } catch (e) {
    console.error(e);
    alert("Error registrando lectura");
  }
});
