// ================== CONFIGURACIÓN DEL JUEGO ==================

// 🎖️ Recompensas base
export const RECOMPENSAS = {
  lecturaNormal: {
    xp: 20,
    monedas: 5
  },
  retoCompletado: {
    xp: 100,
    monedas: 25,
    prestigio: 1
  }
};

// 🟣 Objetos raros
export const OBJETOS_RAROS = [

  {
    id: "pluma_fenix",
    nombre: "Pluma de Fénix",
    descripcion: "Aumenta la XP obtenida durante 7 días",
    rareza: "raro",
    tipo: "pasivo",
    duracion: 7,
    icono: "🪶",
    efectos: {
      multiplicadorXP: 1.2
    }
  },

  {
    id: "marca_dragon",
    nombre: "Marcapáginas del Dragón",
    descripcion: "Otorga monedas extra al terminar libros",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "🐉",
    efectos: {
      monedas: 100
    }
  },

  {
    id: "lupa_detective",
    nombre: "Lupa de detective",
    descripcion: "Aumenta la probabilidad de encontrar logros secretos",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "🔍",
    efectos: {
      bonusLogrosSecretos: 0.15
    }
  },

  {
    id: "taza_magica",
    nombre: "Taza de café mágico",
    descripcion: "Ganas XP extra en lecturas nocturnas",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "☕",
    efectos: {
      xpNocturna: 10
    }
  }


//
//
//  "Marcapáginas de dragón",
//  "Lupa de detective",
//  "Pluma encantada",
//  "Taza de café mágico",
//  "Capa de invisibilidad de biblioteca"

];

// 🟡 Objetos legendarios
export const OBJETOS_LEGENDARIOS = [
  {
    id: "grimorio_eterno",
    nombre: "Grimorio Eterno",
    descripcion: "Duplica la XP de los retos completados",
    multiplicadorXP: 2,
    rareza: "legendario"
  },
  {
    id: "biblioteca_ancestral",
    nombre: "Biblioteca Ancestral",
    descripcion: "Otorga prestigio adicional por cada reto",
    bonusPrestigio: 100,
    rareza: "legendario"
  },
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

export const LOGROS = [

  // ======================
  // 🌱 MICRO-LOGROS (todos ganan algo)
  // ======================

  {
    id: "primer_libro",
    nombre: "Primer capítulo",
    descripcion: "Completaste tu primera lectura",
    tipo: "micro",
    icono: "📘",
    condicion: (stats) => stats.totalLibros >= 1
  },

  {
    id: "primera_resena",
    nombre: "Opinión propia",
    descripcion: "Escribiste tu primera reseña",
    tipo: "micro",
    icono: "✍️",
    condicion: (stats) => stats.totalResenas >= 1
  },

  {
    id: "racha_3_dias",
    nombre: "Constancia",
    descripcion: "Leíste 3 días seguidos",
    tipo: "micro",
    icono: "🔥",
    condicion: (stats) => stats.rachaDias >= 3
  },

  // ======================
  // 📚 LOGROS NORMALES
  // ======================

  {
    id: "lector_incansable",
    nombre: "Lector incansable",
    descripcion: "Completaste 10 libros",
    tipo: "normal",
    icono: "📚",
    condicion: (stats) => stats.totalLibros >= 10
  },

  {
    id: "tocho_1000",
    nombre: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    tipo: "normal",
    icono: "📖",
    condicion: (l) => l.paginas >= 1000
  },

  {
    id: "nocturno",
    nombre: "Lector/a nocturno",
    descripcion: "Terminaste un libro entre las 00:00 y las 06:00",
    tipo: "normal",
    icono: "🌙",
    condicion: () => {
      const h = new Date().getHours();
      return h >= 0 && h < 6;
    }
  },

  // ======================
  // 🎭 GÉNEROS
  // ======================

  {
    id: "romantico",
    nombre: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    tipo: "normal",
    icono: "❤️",
    condicion: (l) => l.categoria?.toLowerCase().includes("romance")
  },

  {
    id: "erotico",
    nombre: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    tipo: "normal",
    icono: "🔥",
    condicion: (l) => l.categoria?.toLowerCase().includes("erótico")
  },

  {
    id: "fantasia",
    nombre: "Soñador/a empedernido",
    descripcion: "Leíste literatura fantástica",
    tipo: "normal",
    icono: "🐉",
    condicion: (l) => l.categoria?.toLowerCase().includes("fantasia")
  },

    {
    id: "cf",
    nombre: "Mente científica",
    descripcion: "Leíste ciencia ficción",
    tipo: "normal",
    icono: "📚",
    condicion: (l) => l.categoria?.toLowerCase().includes("ciencia ficción")
  },

  // ======================
  // ⭐ LOGROS ESPECIALES
  // ======================

  {
    id: "critico_literario",
    nombre: "Crítico literario ⭐⭐⭐⭐½",
    descripcion: "Diste una valoración media superior a 4,5",
    tipo: "especial",
    icono: "⭐",
    condicion: (stats) => stats.mediaValoraciones >= 4.5
  },

  {
    id: "devorador_anual",
    nombre: "Devorador/a de bibliotecas",
    descripcion: "Leíste 30 libros en un año",
    tipo: "especial",
    icono: "🏛️",
    condicion: (stats) => stats.librosAnio >= 30
  },

  // ======================
  // 🏆 COMPETITIVOS / COMUNIDAD
  // ======================

  {
    id: "primer_reto",
    nombre: "Velocidad lectora",
    descripcion: "Fuiste el primero/a en completar un reto",
    tipo: "competitivo",
    icono: "⚡",
    condicion: (reto) => reto.posicion === 1
  },

  {
    id: "campeon_retros",
    nombre: "Campeón/a de los retos",
    descripcion: "Ganaste más retos este año",
    tipo: "competitivo",
    icono: "🏆",
    condicion: (stats) => stats.rankRetos === 1
  }

];


//// 🏆 Logros posibles
//export const LOGROS = [
//  {
//    id: "primer_libro",
//    nombre: "Primer capítulo",
//    descripcion: "Completa tu primera lectura"
//  },
//  {
//    id: "lector_incansable",
//    nombre: "Lector incansable",
//    descripcion: "Completa 10 libros"
//  },
//  {
//    id: "heroe_del_reto",
//    nombre: "Héroe del reto",
//    descripcion: "Completa un reto mensual"
//  },
//    // 🧩 RETOS
//  {
//    id: "reto_enero",
//    titulo: "Reto de Enero superado",
//    descripcion: "Completaste el reto mensual",
//    tipo: "reto",
//    condicion: (l) => l.esReto === true
//  },
//
//  // 📚 PÁGINAS
//  {
//    id: "tocho_1000",
//    titulo: "Lector/a de tochos",
//    descripcion: "Leíste un libro de 1000 páginas o más",
//    condicion: (l) => l.paginas >= 1000
//  },
//
//  // 📦 GÉNEROS
//  {
//    id: "romantico",
//    titulo: "Corazón de tinta",
//    descripcion: "Leíste un libro romántico",
//    condicion: (l) => l.categoria?.toLowerCase().includes("romance")
//  },
//  {
//    id: "erotico",
//    titulo: "Lector/a cachondo/a 😏",
//    descripcion: "Leíste literatura erótica",
//    condicion: (l) => l.categoria?.toLowerCase().includes("erótico")
//  },
//   {
//    id: "fantasia",
//    titulo: "Soñador/a empedernido, un solo mundo no es suficiente",
//    descripcion: "Leíste literatura fantástica",
//    condicion: (l) => l.categoria?.toLowerCase().includes("fantasia")
//  },
//   {
//    id: "terror",
//    titulo: "Mal  rollito por leer libros de miedo por la noche",
//    descripcion: "Leíste un libro de terror",
//    condicion: (l) => l.categoria?.toLowerCase().includes("terror")
//  },
//
//  // 🌙 HÁBITOS
//  {
//    id: "nocturno",
//    titulo: "Lector/a nocturno",
//    descripcion: "Terminaste un libro entre las 00:00 y las 06:00",
//    condicion: () => {
//      const h = new Date().getHours();
//      return h >= 0 && h < 6;
//    }
//  },
//{
//  id: "mes_10_libros",
//  titulo: "Devorador/a de libros",
//  condicion: () => {
//    const ahora = new Date();
//    const mes = ahora.getMonth();
//    const año = ahora.getFullYear();
//
//    const librosMes = lecturasCache.filter(l => {
//      if (!l.fechaFin) return false;
//      const f = l.fechaFin.toDate();
//      return f.getMonth() === mes && f.getFullYear() === año;
//    });
//
//    return librosMes.length >= 10;
//  }
//},
//{
//  id: "mes_5_libros",
//  titulo: "Super lector/a",
//  condicion: () => {
//    const ahora = new Date();
//    const mes = ahora.getMonth();
//    const año = ahora.getFullYear();
//
//    const librosMes = lecturasCache.filter(l => {
//      if (!l.fechaFin) return false;
//      const f = l.fechaFin.toDate();
//      return f.getMonth() === mes && f.getFullYear() === año;
//    });
//
//    return librosMes.length >= 5;
//  }
//},
//
//{
//  id: "anio_20_libros",
//  titulo: "Devorador/a de libros",
//  condicion: () => {
//    const añoActual = new Date().getFullYear();
//
//    const librosAnio = lecturasCache.filter(l => {
//      if (!l.fechaFin) return false;
//      const f = l.fechaFin.toDate();
//      return f.getFullYear() === añoActual;
//    });
//
//    return librosAnio.length >= 20;
//  }
//},
//
//{
//  id: "anio_30_libros",
//  titulo: "Devorador/a de bibliotecas",
//  condicion: () => {
//    const añoActual = new Date().getFullYear();
//
//    const librosAnio = lecturasCache.filter(l => {
//      if (!l.fechaFin) return false;
//      const f = l.fechaFin.toDate();
//      return f.getFullYear() === añoActual;
//    });
//
//    return librosAnio.length >= 30;
//  }
//}
//];
