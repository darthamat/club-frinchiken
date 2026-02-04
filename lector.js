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

const listaLecturasEl = document.getElementById("listaLecturas");
const btnToggleTerminadas = document.createElement("button");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaLecturasEl.parentNode.insertBefore(btnToggleTerminadas, listaLecturasEl.nextSibling);
const btnBuscar = document.getElementById("btnBuscar");

const usuarioXP = document.getElementById("xpUsuario");
const usuarioPrestigio = document.getElementById("usuarioPrestigio");
const usuarioMonedas = document.getElementById("usuarioMonedas");

const btnAsignarAdmin = document.getElementById("btn-asignar-admin");
const btnNuevoReto = document.getElementById("btn-nuevo-reto");
const selectAdmin = document.getElementById("selectAdmin");

let modoCrearReto = false;

let usuarioActual = {
  uid: null,       // se llenará al cargar el usuario
  role: null,
  tipoAdmin: null
};

let timeoutBusqueda;

inputBusqueda.addEventListener("input", () => {
  clearTimeout(timeoutBusqueda);

  timeoutBusqueda = setTimeout(() => {
    buscarLibros(inputBusqueda.value);
  }, 500);
});

// Lista de usuarios (ejemplo, en tu proyecto la traes de Firestore)
let usuarios = [];

const objetosRaros = [
  "Marcapáginas de dragón",
  "Lupa de detective",
  "Pluma encantada",
  "Taza de café mágico",
  "Capa de invisibilidad de biblioteca"
];

const objetosLegendarios = [
  "El Anillo Único",
  "Un huevo de dragon de Daenerys",
  "La dragonlance",
  "La segunda bola de dragon",
  "Sombrero de Terry Pratchett",
  "Tercer libro de El nombre del Viento",
  "La granada de Antioquia",
  "Chapines de rubies",
  "La pipa de Bilbo",
  "Tiara de Donut",
  "eBook de Mithril",
  "Gafas de lectura Jhony N5",
  "Espada de Gandalf",
  "Armadura de páginas de la primera Biblia"
];

const LOGROS = [
  // 🧩 RETOS
  {
    id: "reto_enero",
    titulo: "Reto de Enero superado",
    descripcion: "Completaste el reto mensual",
    tipo: "reto",
    condicion: (l) => l.esReto === true
  },

  // 📚 PÁGINAS
  {
    id: "tocho_1000",
    titulo: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    condicion: (l) => l.paginas >= 1000
  },

  // 📦 GÉNEROS
  {
    id: "romantico",
    titulo: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    condicion: (l) => l.categoria?.toLowerCase().includes("romance")
  },
  {
    id: "erotico",
    titulo: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    condicion: (l) => l.categoria?.toLowerCase().includes("erótico")
  },
   {
    id: "fantasia",
    titulo: "Soñador/a empedernido, un solo mundo no es suficiente",
    descripcion: "Leíste literatura fantástica",
    condicion: (l) => l.categoria?.toLowerCase().includes("fantasia")
  },
   {
    id: "terror",
    titulo: "Mal  rollito por leer libros de miedo por la noche",
    descripcion: "Leíste un libro de terror",
    condicion: (l) => l.categoria?.toLowerCase().includes("terror")
  },

  // 🌙 HÁBITOS
  {
    id: "nocturno",
    titulo: "Lector/a nocturno",
    descripcion: "Terminaste un libro entre las 00:00 y las 06:00",
    condicion: () => {
      const h = new Date().getHours();
      return h >= 0 && h < 6;
    }
  },
{
  id: "mes_10_libros",
  titulo: "Devorador/a de libros",
  condicion: () => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();

    const librosMes = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getMonth() === mes && f.getFullYear() === año;
    });

    return librosMes.length >= 10;
  }
},
{
  id: "mes_5_libros",
  titulo: "Super lector/a",
  condicion: () => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();

    const librosMes = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getMonth() === mes && f.getFullYear() === año;
    });

    return librosMes.length >= 5;
  }
},

{
  id: "anio_20_libros",
  titulo: "Devorador/a de libros",
  condicion: () => {
    const añoActual = new Date().getFullYear();

    const librosAnio = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getFullYear() === añoActual;
    });

    return librosAnio.length >= 20;
  }
},

{
  id: "anio_30_libros",
  titulo: "Devorador/a de bibliotecas",
  condicion: () => {
    const añoActual = new Date().getFullYear();

    const librosAnio = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getFullYear() === añoActual;
    });

    return librosAnio.length >= 30;
  }
}
  
];

// ---------------- ESTADO ----------------
//let usuarioActual = null;
let usuarioData = null;
let lecturasCache = [];
let retoCache = null;
let mostrarTerminados = false;


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
    portadaUrl: libro.portadaUrl,
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
  categoriaInput.value = libro.categoria;
}

// ------------------ FUNCIÓN ORIGINAL REGISTRAR LECTURA ------------------
async function registrarLecturaNormal() {
  if (!usuarioActual) return;

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value),
    categoria: categoriaInput.value || "",
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
      categoria: categoriaInput.value,
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
      paginas: Number(paginasInput.value),
      categoria: categoriaInput.value || "",
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
        categoria: reto.categoria,
        paginas: reto.paginas,
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

//comprobarNivel();
    
  } else {
    await updateDoc(userRef, { prestigio: increment(l.paginas) });
    
    usuarioPrestigio.textContent = Number(usuarioPrestigio.textContent) + l.paginas;
    
    alert(`⭐ Lectura completada. Prestigio + ${l.paginas}`);
  }

  // Recompensas
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

// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadas.addEventListener("click", () => {
  mostrarTerminados = !mostrarTerminados;
  btnToggleTerminadas.textContent = mostrarTerminados
    ? "Ocultar lecturas terminadas"
    : "Mostrar lecturas terminadas";
  pintarLecturas();
});

// ---------------- BÚSQUEDA LIBROS ----------------
async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=20`
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
      paginas: info.pageCount,
      categoria: info.categories?.join(", ") || "",
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
btnBuscar.addEventListener("click", () => {
  const texto = busquedaLibro.value.trim();
  if (!texto) return alert("Escribe algo para buscar");
  buscarLibros(texto);
});

function xpNecesariaParaNivel(nivel) {
  if (nivel <= 5) return 400 + (nivel - 1) * 150;
  if (nivel <= 10) return 1300 + (nivel - 6) * 350;
  return 3600 + (nivel - 11) * 1000;
}

//logros

async function comprobarLogros(lectura) {
  const userRef = doc(db, "users", usuarioActual.uid);
  usuarioData.logros ??= {};

  for (const logro of LOGROS) {
    if (usuarioData.logros[logro.id]) continue;

    if (logro.condicion?.(lectura)) {
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
