import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, addDoc, Timestamp, query, where, getDocs
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
const paginasInput = document.getElementById("Paginas");
const categoriaInput = document.getElementById("categoria");

const tituloLibro = document.getElementById("titulo");
const autorLibro = document.getElementById("autor");
const paginasLibro = document.getElementById("paginas");
const categoriaLibro = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro"); // este id no estaba en tu HTML

const listaLecturasEl = document.getElementById("listaLecturas");


let usuarioActual = null;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioActual = user;
  cargarPerfilUsuario();
  cargarLecturas();
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


//boton reto
btnReto.addEventListener("click", async () => {
  try {
    const retoRef = doc(db, "retos", "2026_01");
    const snap = await getDoc(retoRef);
    if (!snap.exists()) return;

    const reto = snap.data();

    // Rellenar formulario
    tituloInput.value = reto.Titulo || "";
    autorInput.value = reto.Autor || "";
    paginasInput.value = reto.Paginas ||150;

    const categoria = reto.categoria || "Fantasía";

    // Añadir categoría si no existe
    if (![...categoriaInput.options].some(o => o.value === categoria)) {
      const opt = document.createElement("option");
      opt.value = categoria;
      opt.textContent = categoria;
      categoriaInput.appendChild(opt);
    }
    categoriaInput.value = categoria;

    // Portada si existe
    if (reto.portadaUrl && portadaLibro) {
      portadaLibro.src = reto.portadaUrl;
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

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`
  );
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.addEventListener("click", () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || 0;

      // Categoría dinámica
      const categoria = info.categories?.[0] || "Fantasía";

      if (![...categoriaInput.options].some(o => o.value === categoria)) {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaInput.appendChild(opt);
      }
      categoriaInput.value = categoria;

      // Portada
      if (info.imageLinks?.thumbnail && portadaLibro) {
        portadaLibro.src = info.imageLinks.thumbnail;
      }

      resultados.classList.add("hidden");
    });

    resultados.appendChild(li);
  });
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
      const btnTerminarLibro = document.createElement("button");
      btnTerminarLibro.textContent = "📗 Terminado";
      btnTerminarLibro.style.marginLeft = "10px";
      btnTerminarLibro.addEventListener("click", async () => {
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
      li.appendChild(btnTerminarLibro);
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
    categoria: categoriaInput.value,
    activa: true,
    esReto: false,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) {
    return alert("Faltan datos");
  }

  await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  // limpiar formulario
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "Fantasía";

  // 🔥 refrescar lista
  cargarLecturas();
});


//lecturas activas

async function cargarLecturas() {
  listaLecturasEl.innerHTML = "";

  // 🔹 1. Lecturas activas del usuario
  const q = query(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    where("activa", "==", true)
  );
  const snap = await getDocs(q);

  const lecturas = [];
  snap.forEach(doc => lecturas.push({ id: doc.id, ...doc.data() }));

  // 🔹 2. Comprobar reto actual
  const retoRef = doc(db, "retos", "2026_01");
  const retoSnap = await getDoc(retoRef);

  if (retoSnap.exists()) {
    const reto = retoSnap.data();
    const yaExiste = lecturas.some(l => l.esReto);

    if (!yaExiste) {
      // 👉 lo añadimos automáticamente
      const nuevaLecturaReto = {
        titulo: reto.Titulo,
        autor: reto.Autor,
        categoria: reto.categoria || "Fantasía",
        paginas: reto.paginas || 0,
        activa: true,
        esReto: true,
        fechaInicio: new Date()
      };

      await addDoc(
        collection(db, "users", usuarioActual.uid, "lecturas"),
        nuevaLecturaReto
      );

      lecturas.unshift(nuevaLecturaReto);
    }
  }

  // 🔹 3. Pintar lecturas
  lecturas.forEach(l => {
    const li = document.createElement("li");
    li.textContent = `${l.titulo} — ${l.autor}`;

    if (l.esReto) {
      li.style.color = "#FFD700";
      li.style.fontWeight = "bold";
      li.textContent += " [RETO]";
    }

    listaLecturasEl.appendChild(li);
  });
}

