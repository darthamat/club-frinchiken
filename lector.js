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

// ---------------- CARGAR LECTURAS ACTIVAS ----------------
async function cargarLecturas() {
  listaLecturasEl.innerHTML = "Cargando lecturas...";

  // 1️⃣ Lecturas activas del usuario
  const q = query(collection(db, "users", usuarioActual.uid, "lecturas"), where("activa", "==", true));
  const snap = await getDocs(q);

  const lecturas = [];
  const lecturasDocs = []; // guardamos el docRef para actualizar
  snap.forEach(docSnap => {
    lecturas.push(docSnap.data());
    lecturasDocs.push({ id: docSnap.id, ref: docSnap.ref });
  });

  // 2️⃣ Cargar reto actual
  const retoRef = doc(db, "retos", "2026_01");
  const retoSnap = await getDoc(retoRef);
  if (retoSnap.exists()) {
    const reto = retoSnap.data();
    const existe = lecturas.some(l => l.titulo === reto.Titulo);
    if (!existe) {
      lecturas.unshift({
        titulo: reto.Titulo,
        autor: reto.Autor,
        categoria: reto.categoria || "Fantasía",
        reto: true
      });
      lecturasDocs.unshift({ id: null, ref: null }); // sin doc para reto
    }
  }

  // 3️⃣ Mostrar en pantalla
  listaLecturasEl.innerHTML = "";
  lecturas.forEach((l, index) => {
    const li = document.createElement("li");
    li.textContent = `${l.titulo} — ${l.autor} (${l.categoria})`;

    if (l.reto) {
      li.style.fontWeight = "bold";
      li.style.color = "#FFD700"; // dorado para el reto
      li.dataset.reto = "true";
      li.textContent += " [RETO ACTUAL]";
    } else {
      // Botón para marcar como terminado
      const btnTerminar = document.createElement("button");
      btnTerminar.textContent = "📗 Terminado";
      btnTerminar.style.marginLeft = "10px";
      btnTerminar.addEventListener("click", async () => {
        try {
          const lecturaDoc = lecturasDocs[index];
          if (lecturaDoc.ref) {
            await setDoc(lecturaDoc.ref, { activa: false, fechaFin: new Date() }, { merge: true });
            cargarLecturas();
          }
        } catch (e) {
          console.error(e);
          alert("Error al marcar como terminado");
        }
      });
      li.appendChild(btnTerminar);
    }

    listaLecturasEl.appendChild(li);
  });
}


// ---------------- REGISTRAR NUEVA LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!usuarioActual) return alert("Debes iniciar sesión");

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value),
    categoria: categoriaSelect.value,
    activa: true,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) {
    return alert("Debe poner título y autor");
  }

  try {
    await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), lectura);
    tituloInput.value = "";
    autorInput.value = "";
    paginasInput.value = "";
    categoriaSelect.value = "Fantasía";

    // Refrescar lista inmediatamente
    cargarLecturas();
  } catch (e) {
    console.error(e);
    alert("Error registrando lectura");
  }
});
