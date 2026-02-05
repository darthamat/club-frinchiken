
// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  where,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  enableIndexedDbPersistence,
  increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  RECOMPENSAS,
  OBJETOS_RAROS,
  OBJETOS_LEGENDARIOS,
  LOGROS
} from "./gameConfig.js";

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

// 🔥 CACHÉ LOCAL FIRESTORE
enableIndexedDbPersistence(db).catch(() => {
  console.warn("Persistencia local no disponible");
});

// ---------------- DOM ----------------
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const claseEl = document.getElementById("clasePersonaje");
const nivelEl = document.getElementById("nivelUsuario");
const xpBarraEl = document.getElementById("barraXP");
const xpTextoEl = document.getElementById("xpUsuario");

const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");

const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");
const btnLogout = document.getElementById("btnLogout");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro");

// const listaLecturasEl = document.getElementById("listaLecturas");
const btnToggleTerminadas = document.createElement("button");
const btnToggleTerminadasLibres = document.createElement("button");

btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
btnToggleTerminadasLibres.textContent = "Mostrar lecturas terminadas";

// listaLecturasEl.parentNode.insertBefore(btnToggleTerminadas, listaLecturasEl.nextSibling);
const btnBuscar = document.getElementById("btnBuscar");

const usuarioXP = document.getElementById("xpUsuario");
const usuarioPrestigio = document.getElementById("usuarioPrestigio");
const usuarioMonedas = document.getElementById("usuarioMonedas");

const btnAsignarAdmin = document.getElementById("btn-asignar-admin");
const btnNuevoReto = document.getElementById("btn-nuevo-reto");
const selectAdmin = document.getElementById("selectAdmin");

const listaRetosEl = document.getElementById("listaRetos");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaRetosEl.parentNode.insertBefore(btnToggleTerminadas, listaRetosEl.nextSibling);

const listaLibresEl = document.getElementById("listaLibres");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaLibresEl.parentNode.insertBefore(btnToggleTerminadasLibres, listaLibresEl.nextSibling);

let modoCrearReto = false;

let usuarioActual = {
  uid: null,       // se llenará al cargar el usuario
  role: null,
  tipoAdmin: null
};


// Lista de usuarios (ejemplo, en tu proyecto la traes de Firestore)
let usuarios = [];

// ---------------- ESTADO ----------------
//let usuarioActual = null;
let usuarioData = null;
let lecturasCache = [];
let retoCache = null;
let mostrarTerminados = false;
let mostrarTerminadosLibres = false;


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔑 ESTA LÍNEA ES LA CLAVE
  usuarioActual.uid = user.uid;

  await cargarPerfilUsuario();
  await cargarLecturas();
  pintarLogros();
});




// ---------------- LOGOUT ----------------
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- PERFIL ----------------
async function cargarPerfilUsuario() {
  const snap = await getDoc(doc(db, "users", usuarioActual.uid));
  if (!snap.exists()) return;

  const data = snap.data();

  usuarioData = {
    experiencia: data.experiencia ?? 0,
    nivel: data.nivel ?? 1,
    experienciaNecesario:
      data.experienciaNecesario ?? xpNecesariaParaNivel(data.nivel ?? 1),
    prestigio: data.prestigio ?? 0,
    monedas: data.monedas ?? 0,
    logros: data.logros ?? {},
    nombrePersonaje: data.nombrePersonaje,
    clase: data.clase
  };

usuarioActual.role = data.role ?? "user";
usuarioActual.tipoAdmin = data.tipoAdmin ?? null;

actualizarBotonesAdmin();


  nombrePersonajeEl.textContent = usuarioData.nombrePersonaje || "Sin nombre";
  claseEl.textContent = usuarioData.clase || "Aventurero";
  nivelEl.textContent = usuarioData.nivel;
  usuarioPrestigio.textContent = usuarioData.prestigio;
  usuarioMonedas.textContent = usuarioData.monedas;

  actualizarXP(false); // ⛔ sin alert al cargar

  //pintarLogros();
}

function actualizarBotonesAdmin() {
  if (!btnAsignarAdmin || !btnNuevoReto) return;

  console.log("ROL:", usuarioActual.role);
  console.log("TIPO ADMIN:", usuarioActual.tipoAdmin);

  btnAsignarAdmin.style.display =
    usuarioActual.role === "admin" ? "inline-block" : "none";

  btnNuevoReto.style.display =
    (usuarioActual.role === "admin" || usuarioActual.tipoAdmin === "crear")
      ? "inline-block"
      : "none";
}

async function mostrarSelectAdmin() {
  selectAdmin.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    if (docSnap.id !== usuarioActual.uid) {
      const u = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;


      const nombreReal = u.nombreReal ?? "Sin nombre";
const personaje = u.nombrePersonaje ?? "Sin personaje";

option.textContent = `${nombreReal} (${personaje})`;



     // option.textContent = `${u.nombreReal} (${u.nombrePersonaje})`;
      selectAdmin.appendChild(option);
    }
  });

  selectAdmin.style.display = "inline-block";
}

//btnAsignarAdmin.addEventListener("click", mostrarSelectAdmin);

btnAsignarAdmin.addEventListener("click", async () => {
  if (usuarioActual.role !== "admin") return;

  console.log("Mostrando selector de admin");

  selectAdmin.innerHTML = "";
  selectAdmin.style.display = "inline-block";

  // ✅ Traer usuarios
  const snapshot = await getDocs(collection(db, "users"));

   await cargarUsuarios();

snapshot.forEach(docSnap => {
  const data = docSnap.data();
  if (docSnap.id === usuarioActual.uid) return; // omitirte a ti
  const option = document.createElement("option");
  option.value = docSnap.id;
  const nombreReal = data.nombreReal ?? "Sin nombre";
  const personaje = data.nombrePersonaje ?? "Sin personaje";
  option.textContent = `${nombreReal} (${personaje})`;
  selectAdmin.appendChild(option);
});

  if (selectAdmin.children.length === 0) {
    alert("⚠️ No hay usuarios disponibles para asignar");
  }
});

//selectAdmin.addEventListener("change", asignarAdmin);

selectAdmin.addEventListener("change", async () => {
  const uidNuevoAdmin = selectAdmin.value;
  if (!uidNuevoAdmin) return;

  // 1️⃣ Quitar admin temporal anterior
  const q = query(
    collection(db, "users"),
    where("tipoAdmin", "==", "crear")
  );

  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await updateDoc(d.ref, { tipoAdmin: null });
  }

  // 2️⃣ Asignar nuevo admin temporal
  await updateDoc(doc(db, "users", uidNuevoAdmin), {
    tipoAdmin: "crear"
  });

  alert("👑 El poder ha sido transferido");

  selectAdmin.style.display = "none";
});

btnNuevoReto.addEventListener("click", activarModoCrearReto);

function activarModoCrearReto() {
  modoCrearReto = true;

  const panel = document.querySelector(".registro-lectura");

  panel.scrollIntoView({ behavior: "smooth", block: "center" });

  panel.classList.add("modo-reto");

  mostrarMensajeReto("📖 Selecciona el libro para el nuevo reto");
}

function mostrarMensajeReto(texto) {
  const msg = document.getElementById("mensajeReto");
  msg.textContent = texto;
  msg.classList.remove("hidden");
}

async function crearRetoConLibro(libro) {
  const retoData = {
    titulo: libro.titulo,
    autor: libro.autor,
    categoria: libro.categoria ?? "",
    portadaUrl: libro.portadaUrl ?? null,
    paginas: libro.paginas ?? 0,
    creadoPor: usuarioActual.uid,
    fecha: new Date()
  };

  // 1️⃣ Guardar reto "actual"
  await setDoc(doc(db, "retos", "reto-actual"), retoData);

  // 2️⃣ Crear documento histórico
  // Obtenemos el año y mes para generar algo tipo "actual2601", "actual2602", ...
  const ahora = new Date();
  const idHistorico = await generarIdRetoHistorico();

  await setDoc(doc(db, "retos", idHistorico), retoData);

  modoCrearReto = false;

  // Mensaje de éxito
  document.querySelector(".registro-lectura").classList.remove("modo-reto");
  document.getElementById("mensajeReto").textContent = "✅ Nuevo reto creado";

  setTimeout(() => {
    document.getElementById("mensajeReto").classList.add("hidden");
  }, 2000);
}

// Función para generar un ID histórico secuencial
async function generarIdRetoHistorico() {
  // Buscamos todos los documentos de retos cuyo ID empieza con "actual"
  const snap = await getDocs(collection(db, "retos"));
  let maxNumero = 0;

  snap.forEach(docSnap => {
    const id = docSnap.id;
    const match = id.match(/^actual(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNumero) maxNumero = num;
    }
  });

  // Siguiente número
  const nuevoNumero = maxNumero + 1;
  return `actual${nuevoNumero}`;
}

// ------------------ SELECCIONAR LIBRO ------------------
function seleccionarLibro(libro) {
  // Rellenar el formulario con los datos del libro
  rellenarFormularioLectura(libro);

  if (modoCrearReto) {
    // Cambiar botón de registrar a "Registrar nuevo reto"
    btnRegistrar.textContent = "Registrar nuevo reto";

    // Cuando se haga click, crear el reto en Firestore
    btnRegistrar.onclick = async () => {
      await crearRetoConLibro(libro);

      // Volver el botón a su estado normal
      btnRegistrar.textContent = "Registrar lectura";
      btnRegistrar.onclick = registrarLecturaNormal; // función original de registrar lectura
    };
  } else {
    // Si no estamos creando un reto, aseguramos que el botón funcione normalmente
    btnRegistrar.textContent = "Registrar lectura";
    btnRegistrar.onclick = registrarLecturaNormal;
  }
}

// ------------------ RELLENAR FORMULARIO ------------------
function rellenarFormularioLectura(libro) {
  tituloInput.value = libro.titulo || "";
  autorInput.value = libro.autor || "";
  paginasInput.value = libro.paginas || 0;
  portadaLibro.src = libro.portadaUrl || "https://via.placeholder.com/120x180";

  // Categoría solo si existe
  // categoriaInput.value = libro.categoria || "";
  if (libro.categoria) {
  asegurarCategoriaEnSelect(libro.categoria);
}

}

// ------------------ FUNCIÓN ORIGINAL REGISTRAR LECTURA ------------------
async function registrarLecturaNormal() {
  if (!usuarioActual) return;

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value) || 0,
    categoria: categoriaInput?.value ?? "",
    portadaUrl: portadaLibro.src ?? null,
    activa: true,
    progreso: 0,
    esReto: false,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) return alert("Faltan datos");

  const ref = await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  lecturasCache.unshift({ id: ref.id, ...lectura });
  pintarLecturas();

  // Limpiar inputs
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  busquedaLibro.value = "";
  resultados.innerHTML = "";
  resultados.classList.add("hidden");
}

function actualizarXP(mostrarAlert = false) {
  if (!usuarioData.experienciaNecesario || usuarioData.experienciaNecesario <= 0) {
    usuarioData.experienciaNecesario = xpNecesariaParaNivel(usuarioData.nivel);
  }

  while (usuarioData.experiencia >= usuarioData.experienciaNecesario) {
    usuarioData.experiencia -= usuarioData.experienciaNecesario;
    usuarioData.nivel++;
    usuarioData.experienciaNecesario = xpNecesariaParaNivel(usuarioData.nivel);

    if (mostrarAlert) {
      alert(`✨ ¡Has subido al nivel ${usuarioData.nivel}!`);
    }
  }

  nivelEl.textContent = usuarioData.nivel;
  xpBarraEl.style.width =
    `${(usuarioData.experiencia / usuarioData.experienciaNecesario) * 100}%`;
  xpTextoEl.textContent =
    `${usuarioData.experiencia} / ${usuarioData.experienciaNecesario} XP`;
}


// ---------------- RETO ----------------
async function cargarReto() {
  if (retoCache) return retoCache;

  const snap = await getDoc(doc(db, "retos", "reto-actual"));
  if (!snap.exists()) return null;

  retoCache = snap.data();
  return retoCache;
}

btnReto.addEventListener("click", async () => {
  const reto = await cargarReto();
  if (!reto) return;

  tituloInput.value = reto.titulo || "";
  autorInput.value = reto.autor || "";
  paginasInput.value = reto.paginas || "";
  categoriaInput.value = reto.categoria || "";
  portadaLibro.src = reto.portadaUrl || "";
});

// ---------------- REGISTRAR LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!tituloInput.value || !autorInput.value) return alert("Faltan datos");

  if (modoCrearReto) {
    // Crear reto en Firestore
    await setDoc(doc(db, "retos", "reto-actual"), {
      titulo: tituloInput.value,
      autor: autorInput.value,
      paginas: Number(paginasInput.value),
      categoria: categoriaInput.value || "",
      portadaUrl: portadaLibro.src,
      creadoPor: usuarioActual.uid,
      fecha: new Date()
    });

    alert("📚 Nuevo reto creado con éxito!");

    modoCrearReto = false;
    btnRegistrar.textContent = "Registrar lectura";
    mostrarMensajeReto("Selecciona un libro para registrar una lectura");

    // Limpiar campos si quieres
    tituloInput.value = "";
    autorInput.value = "";
    paginasInput.value = "";
    categoriaInput.value = "";
    portadaLibro.src = "https://via.placeholder.com/120x180";

    resultados.innerHTML = "";
    resultados.classList.add("hidden");
  } else {
    // Código normal de registrar lectura
    const lectura = {
      titulo: tituloInput.value.trim(),
      autor: autorInput.value.trim(),
      paginas: Number(paginasInput.value) || 0,
      categoria: categoriaInput?.value ?? "",
      activa: true,
      progreso: 0,
      esReto: false,
      fechaInicio: new Date()
    };

    const ref = await addDoc(
      collection(db, "users", usuarioActual.uid, "lecturas"),
      lectura
    );

    lecturasCache.unshift({ id: ref.id, ...lectura });
    pintarLecturas();

    // Limpiar inputs
    tituloInput.value = "";
    autorInput.value = "";
    paginasInput.value = "";
    categoriaInput.value = "";
    portadaLibro.src = "https://via.placeholder.com/120x180";

    resultados.innerHTML = "";
    resultados.classList.add("hidden");
  }
});


  // Cambiar texto del botón
  btnRegistrar.textContent = "Registrar nuevo reto";

  // Limpiar campos
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  // Mostrar mensaje
  mostrarMensajeReto("📖 Selecciona el libro para el nuevo reto");

  // Hacer scroll al panel
  document.querySelector(".registro-lectura").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


// ---------------- CARGAR LECTURAS ----------------
async function cargarLecturas() {
  const snap = await getDocs(
    query(collection(db, "users", usuarioActual.uid, "lecturas"))
  );

  lecturasCache = [];
  snap.forEach(d => lecturasCache.push({ id: d.id, ...d.data() }));

  // Añadir reto si no existe en Firestore
  const reto = await cargarReto();
  const retoEnFirestore = lecturasCache.find(l => l.esReto);

  if (reto && !retoEnFirestore) {
    const ref = await addDoc(
      collection(db, "users", usuarioActual.uid, "lecturas"),
      {
        titulo: reto.titulo,
        autor: reto.autor,
        categoria: reto.categoria ?? "",
        paginas: reto.paginas ?? 0,
        activa: true,
        progreso: 0,
        esReto: true,
        fechaInicio: new Date()
      }
    );
    lecturasCache.unshift({
  id: ref.id,
  titulo: reto.titulo,
  autor: reto.autor,
  categoria: reto.categoria,
  paginas: reto.paginas,
  activa: true,
  progreso: 0,
  esReto: true,
  fechaInicio: new Date()
});
  }

  pintarLecturas();
  await comprobarLogrosGlobales();
pintarLogros();

}

async function comprobarLogrosGlobales() {
  for (const l of lecturasCache) {
    await comprobarLogros(l);
  }
}

// ---------------- TERMINAR LECTURA ----------------
async function terminarLectura(l) {
  if (!usuarioActual) return;

  const userRef = doc(db, "users", usuarioActual.uid);
  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);

  // Marcar lectura como inactiva
  await updateDoc(lecturaRef, {
    activa: false,
    fechaFin: new Date()
  });

  l.activa = false;

  // RPG logic
  if (l.esReto) {
  usuarioData.experiencia += l.paginas;

  actualizarXP();

  await updateDoc(userRef, {
    experiencia: usuarioData.experiencia,
    nivel: usuarioData.nivel,
    experienciaNecesario: usuarioData.experienciaNecesario
  });

  alert(`🎉 ¡Reto completado! +${l.paginas} XP`);


    
  } else {
    await updateDoc(userRef, { prestigio: increment(l.paginas) });
    
    usuarioPrestigio.textContent = Number(usuarioPrestigio.textContent) + l.paginas;
    
    alert(`⭐ Lectura completada. Prestigio + ${l.paginas}`);
  }


  const recompensa = generarRecompensas(l.paginas);

  if (recompensa.monedas) {
    await updateDoc(userRef, { monedas: increment(recompensa.monedas) });
   
    usuarioMonedas.textContent =
    Number(usuarioMonedas.textContent) + recompensa.monedas;

usuarioData.monedas += recompensa.monedas;
  usuarioMonedas.textContent = usuarioData.monedas;
    
    alert(`💰 Has conseguido ${recompensa.monedas} marcapáginas!`);
  }

  if (recompensa.objeto) {
    alert(`🎁 Has encontrado un objeto mágico: ${recompensa.objeto}`);
  }

  pintarLecturas();
  await comprobarLogros(l);
  
  
}

// ---------------- PINTAR LECTURAS ----------------
function pintarLecturas() {
  listaRetosEl.innerHTML = "";
  listaLibresEl.innerHTML = "";

  const lista = mostrarTerminados
    ? lecturasCache
    : lecturasCache.filter(l => l.activa);

  lista.forEach((l) => {
   const card = document.createElement("div");
card.className = "lectura-card";
card.dataset.id = l.id; // ✅ Esto es clave

    if (l.esReto) {
      card.classList.add("reto");
    } else {
      card.classList.add("libre");
    }

    card.innerHTML = `
      <span class="badge ${l.esReto ? "reto" : "libre"}">
        ${l.esReto ? "🏆 Reto mensual" : "📚 Lectura libre"}
      </span>

      <div class="lectura-info">
        <strong>${l.titulo}</strong><br>
        <small>${l.autor}</small>
      </div>

      <div class="lectura-progreso">
        <div class="barra">
          <div class="fill" style="width:${l.progreso || 0}%"></div>
        </div>
        <span>${l.progreso || 0}%</span>
      </div>

      <div class="lectura-acciones">
        <button class="btn-progreso" data-delta="-10">-10%</button>
        <button class="btn-progreso" data-delta="10">+10%</button>

        <button class="btn-terminar">
          ${l.esReto ? "🏆 Terminar reto" : "📗 Terminar libro"}
        </button>

        <button class="btn-eliminar">❌</button>
      </div>
    `;

    // Eventos progreso
    card.querySelectorAll(".btn-progreso").forEach(btn => {
      btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
    });

    // Terminar
    card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);

    // Eliminar
    card.querySelector(".btn-eliminar").onclick = async () => {
      const texto = l.esReto
        ? "⚠️ ¿Eliminar este reto?"
        : "⚠️ ¿Eliminar esta lectura?";

      if (!confirm(texto)) return;

      await deleteDoc(
        doc(db, "users", usuarioActual.uid, "lecturas", l.id)
      );

      lecturasCache = lecturasCache.filter(x => x.id !== l.id);
      pintarLecturas();
    };

    // 👉 AQUÍ está la separación REAL
    if (l.esReto) {
      listaRetosEl.appendChild(card);
    } else {
      listaLibresEl.appendChild(card);
    }
  });
}

/*
function pintarLecturas() {
  listaLecturasEl.innerHTML = "";

  const lista = mostrarTerminados
    ? lecturasCache
    : lecturasCache.filter(l => l.activa);

  lista.forEach((l) => {
    const card = document.createElement("div");
    card.className = "lectura-card";

    if (l.esReto) {
      card.classList.add("reto-card");
    }

    card.innerHTML = `
      <div class="lectura-info">
        <strong>${l.titulo}</strong><br>
        <small>${l.autor}</small>
      </div>

      <div class="lectura-progreso">
        <div class="barra">
          <div class="fill" style="width:${l.progreso || 0}%"></div>
        </div>
        <span>${l.progreso || 0}%</span>
      </div>

  <div class="lectura-acciones">
  <button class="btn-progreso" data-delta="-10">-10%</button>
  <button class="btn-progreso" data-delta="10">+10%</button>

  <button class="btn-terminar">
    ${l.esReto ? "🏆 Terminar reto" : "📗 Terminar libro"}
  </button>

  <button class="btn-eliminar" title="Eliminar lectura">❌</button>
</div>
    `;

    // Eventos
    card.querySelectorAll(".btn-progreso").forEach(btn => {
      btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
    });

    card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);

    listaLecturasEl.appendChild(card);

    card.querySelector(".btn-eliminar").onclick = async () => {
  const texto = l.esReto
    ? "⚠️ ¿Eliminar el reto actual?"
    : "⚠️ ¿Eliminar esta lectura?";

  if (!confirm(texto)) return;

  if (l.id) {
    await deleteDoc(
      doc(db, "users", usuarioActual.uid, "lecturas", l.id)
    );
  }

  // Eliminar de memoria
  lecturasCache = lecturasCache.filter(x => x.id !== l.id);

  pintarLecturas();
};
  });
}
*/



// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadas.addEventListener("click", () => {
  mostrarTerminados = !mostrarTerminados;
  btnToggleTerminadas.textContent = mostrarTerminados
    ? "Ocultar lecturas terminadas"
    : "Mostrar lecturas terminadas";
  pintarLecturas();
});

// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadasLibres.addEventListener("click", () => {
  mostrarTerminadosLibres = !mostrarTerminadosLibres;
  btnToggleTerminadasLibres.textContent = mostrarTerminadosLibres
    ? "Ocultar lecturas terminadas"
    : "Mostrar lecturas terminadas";
  pintarLecturas();
});



// ---------------- BÚSQUEDA LIBROS ----------------
async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  // key api = &key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=20&key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0`
  );
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.style.marginBottom = "6px";

    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.onclick = () => seleccionarLibro({
      titulo: info.title,
      autor: info.authors?.[0],
      paginas: info.pageCount || 0,
      categoria: info.categories?.[0] || "",
      portadaUrl: info.imageLinks?.thumbnail
    });

    resultados.appendChild(li);
  });

  // Scroll si hay muchos resultados
  resultados.style.maxHeight = "400px";
  resultados.style.overflowY = "auto";
}


// ---------------- RECOMPENSAS ----------------
function generarRecompensas(paginas) {
  const monedas = Math.floor(Math.random() * (paginas * 1)) + 1;
  const rand = Math.random() * 100;
  let objeto = null;

  if (rand > 95) objeto = objetosLegendarios[Math.floor(Math.random() * objetosLegendarios.length)];
  else if (rand > 85) objeto = objetosRaros[Math.floor(Math.random() * objetosRaros.length)];

  return { monedas, objeto };
}

btnBuscar.addEventListener("click", async () => {
  const texto = busquedaLibro.value.trim();
  if (!texto) {
    alert("Escribe algo para buscar");
    return;
  }

  btnBuscar.disabled = true;
  btnBuscar.textContent = "Buscando...";

  try {
    await buscarLibros(texto);
  } finally {
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Buscar";
  }
});

function xpNecesariaParaNivel(nivel) {
  if (nivel <= 5) return 400 + (nivel - 1) * 150;
  if (nivel <= 10) return 1300 + (nivel - 6) * 350;
  return 3600 + (nivel - 11) * 1000;
}

//logros

async function comprobarLogros(lecturaActual = null) {
  const userRef = doc(db, "users", usuarioActual.uid);
  usuarioData.logros ??= {};

  for (const logro of LOGROS) {
    if (usuarioData.logros[logro.id]) continue;

    const cumple = logro.condicion?.(lecturasCache, lecturaActual);
    if (!cumple) continue;

    usuarioData.logros[logro.id] = {
      fecha: new Date(),
      titulo: logro.titulo
    };

    await updateDoc(userRef, {
      [`logros.${logro.id}`]: {
        fecha: new Date(),
        titulo: logro.titulo
      }
    });

    mostrarNotificacionLogro(logro);
  }
}

//pintar logros

function pintarLogros() {
  const cont = document.getElementById("feedLogros");
  cont.innerHTML = "";

  const logros = usuarioData.logros || {};

  if (Object.keys(logros).length === 0) {
    cont.textContent = "Aún no has desbloqueado logros";
    return;
  }

  Object.values(logros).forEach(l => {
    const div = document.createElement("div");
    div.className = "logro";
    div.innerHTML = `
      <strong>${l.titulo}</strong><br>
      <small>${new Date(l.fecha.seconds * 1000).toLocaleDateString()}</small>
    `;
    cont.appendChild(div);
  });
}
function mostrarNotificacionLogro(logro) {
  alert(`🏆 Logro desbloqueado: ${logro.titulo}`);
}
async function cargarUsuarios() {
  const select = document.getElementById("selectAdmin");
  select.innerHTML = ""; // limpiar

  const snapshot = await getDocs(collection(db, "users")); // ¡users, no usuarios!
  snapshot.forEach(doc => {
    const data = doc.data();

    // No mostrarte a ti mismo
    if (data.role !== "admin") {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.nombreReal} (${data.nombrePersonaje})`;
      select.appendChild(option);
    }
  });
}
async function asignarAdmin() {
  const uidNuevoAdmin = selectAdmin.value;
  if (!uidNuevoAdmin) return;

  // Quitar admin temporal anterior
  const q = query(
    collection(db, "users"),
    where("tipoAdmin", "==", "crear")
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await updateDoc(d.ref, { tipoAdmin: null });
  }

  // Asignar nuevo admin
  await updateDoc(doc(db, "users", uidNuevoAdmin), {
    tipoAdmin: "crear"
  });

  alert("👑 El poder ha sido transferido");

  selectAdmin.style.display = "none";
}

function normalizarCategoria(cat) {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function asegurarCategoriaEnSelect(categoria) {
  if (!categoria) return;

  const valor = normalizarCategoria(categoria);

  // ¿Ya existe?
  const existe = [...categoriaInput.options].some(
    o => o.dataset.norm === valor
  );

  if (!existe) {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    option.dataset.norm = valor;
    categoriaInput.appendChild(option);
  }

  categoriaInput.value = categoria;
}
async function cambiarProgreso(lectura, delta) {
  // Ajustar el progreso localmente
  lectura.progreso = Math.min(100, Math.max(0, (lectura.progreso || 0) + delta));

  // Actualizar la barra visual
  const cardReto = [...listaRetosEl.children].find(c => c.dataset.id === lectura.id);
  const cardLibre = [...listaLibresEl.children].find(c => c.dataset.id === lectura.id);

  [cardReto, cardLibre].forEach(card => {
    if (card) {
      const fill = card.querySelector(".fill");
      const span = card.querySelector(".lectura-progreso span");

      fill.style.width = lectura.progreso + "%";
      span.textContent = lectura.progreso + "%";
    }
  });

  // Guardar progreso en Firestore
  try {
    const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", lectura.id);
    await updateDoc(lecturaRef, { progreso: lectura.progreso });
  } catch (error) {
    console.error("Error guardando progreso:", error);
  }
}
