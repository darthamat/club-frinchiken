   
        // ----------------------------
// 1️⃣ IMPORTS DE FIREBASE
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ----------------------------
// 2️⃣ CONFIGURACIÓN DE FIREBASE
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
  authDomain: "club-frinchiken.firebaseapp.com",
  projectId: "club-frinchiken",
  storageBucket: "club-frinchiken.firebasestorage.app",
  messagingSenderId: "993321884320",
  appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// ----------------------------
// 3️⃣ ELEMENTOS DEL DOM
// ----------------------------
const btnAcceder = document.getElementById("btnAcceder");
const btnLogout = document.getElementById("btnLogout");
const btnReto = document.getElementById("btnReto");
const btnRegistrar = document.getElementById("btnRegistrar");
const inputBusqueda = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaImg = document.querySelector(".libro-seleccionado img");

// ----------------------------
// 4️⃣ LOGIN / LOGOUT
// ----------------------------
btnAcceder.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario logueado:", user.displayName);
    btnAcceder.classList.add("hidden");
    btnLogout.classList.remove("hidden");
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("No se pudo iniciar sesión: " + error.message);
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  btnLogout.classList.add("hidden");
  btnAcceder.classList.remove("hidden");
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    btnAcceder.classList.add("hidden");
    btnLogout.classList.remove("hidden");
  } else {
    btnAcceder.classList.remove("hidden");
    btnLogout.classList.add("hidden");
  }
});

// ----------------------------
// 5️⃣ FUNCIONES BUSCADOR GOOGLE BOOKS
// ----------------------------
async function buscarLibros(texto) {
  if (texto.length < 3) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&langRestrict=es&maxResults=10`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

function mostrarResultados(libros) {
  resultados.innerHTML = "";
  if (libros.length === 0) {
    resultados.classList.add("hidden");
    return;
  }

  libros.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/40x60'}">
      <div class="info">
        <strong>${info.title}</strong><br>
        <span>${info.authors?.[0] || "Autor desconocido"}</span>
      </div>
    `;
    li.addEventListener("click", () => {
      rellenarFormulario(info, "libre");
      resultados.classList.add("hidden");
    });
    resultados.appendChild(li);
  });

  resultados.classList.remove("hidden");
}

// Input con debounce para no saturar la API
let timeoutBusqueda;
inputBusqueda.addEventListener("input", () => {
  clearTimeout(timeoutBusqueda);
  timeoutBusqueda = setTimeout(async () => {
    const libros = await buscarLibros(inputBusqueda.value.trim());
    mostrarResultados(libros);
  }, 400);
});

// ----------------------------
// 6️⃣ RELLENAR FORMULARIO
// ----------------------------
function rellenarFormulario(info, tipo) {
  tituloInput.value = info.title || "";
  autorInput.value = info.authors?.[0] || "";
  paginasInput.value = info.pageCount || 0;
  portadaImg.src = info.imageLinks?.thumbnail || "";
  categoriaInput.value = info.categories?.[0] || "Fantasía";
  tituloInput.dataset.tipo = tipo; // "libre" o "reto"
}

// ----------------------------
// 7️⃣ BOTÓN RETO ACTUAL
// ----------------------------
btnReto.addEventListener("click", async () => {
  const usuario = auth.currentUser;
  if (!usuario) {
    alert("Debes iniciar sesión");
    return;
  }

  const retoRef = doc(db, "retos", "2026_01"); // Ejemplo de reto
  const retoSnap = await getDoc(retoRef);

  if (!retoSnap.exists()) {
    alert("No hay reto activo");
    return;
  }

  const reto = retoSnap.data();

  rellenarFormulario({
    title: reto.Titulo,
    authors: [reto.Autor],
    pageCount: reto.paginas || 0,
    categories: [reto.categoria || "Fantasía"],
    imageLinks: { thumbnail: reto.portadaUrl }
  }, "reto");
});

// ----------------------------
// 8️⃣ BOTÓN REGISTRAR LECTURA
// ----------------------------
btnRegistrar.addEventListener("click", async () => {
  const usuario = auth.currentUser;
  if (!usuario) {
    alert("Debes iniciar sesión");
    return;
  }

  const titulo = tituloInput.value.trim();
  const autor = autorInput.value.trim();
  const paginas = parseInt(paginasInput.value);
  const categoria = categoriaInput.value;
  const portada = portadaImg.src;
  const tipo = tituloInput.dataset.tipo || "libre";

  if (!titulo || !autor || !paginas) {
    alert("Completa los campos obligatorios");
    return;
  }

  // Guardar lectura en Firestore
  await addDoc(collection(db, "users", usuario.uid, "lecturas"), {
    titulo,
    autor,
    categoria,
    paginas,
    portada,
    tipo,
    estado: "terminado",
    fechaInicio: Timestamp.now(),
    fechaFin: Timestamp.now(),
    prestigioOtorgado: paginas,
    botinGenerado: false
  });

  // Actualizar prestigio del usuario
  const userRef = doc(db, "users", usuario.uid);
  await updateDoc(userRef, {
    prestigio: (usuario.prestigio || 0) + paginas
  });

  alert(`📘 Lectura registrada! Prestigio +${paginas}`);
});
