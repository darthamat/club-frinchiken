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
    titulo: "Pluma de Fénix",
    descripcion: "Aumenta el prestigio obtenido durante 7 días",
    rareza: "raro",
    tipo: "pasivo",
    duracion: 7,
    icono: "🪶",
    efectos: {
      multiplicadorP: 1.5
    }
  },

  {
    id: "marca_dragon",
    titulo: "Marcapáginas del Dragón",
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
    titulo: "Lupa de detective",
    descripcion: "Aumenta la probabilidad de encontrar logros secretos",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "🔍",
    efectos: {
      bonusLogrosSecretos: 0.25
    }
  },

  {
    id: "taza_magica",
    titulo: "Taza de café mágico",
    descripcion: "Ganas XP extra en lecturas nocturnas",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "☕",
    efectos: {
      xpNocturna: 50
    }
  },

  {
    id: "amuleto_suerte",
    titulo: "Amuleto de la suerte",
    descripcion: "Ganas XP extra en lecturas",
    rareza: "raro",
    tipo: "pasivo",
    duracion: null,
    icono: "🧿",
    efectos: {
      xp: 5,
      bonusPrestigio: 1.5
    }
  },

  {
    id: "orangutan",
    titulo: "Mascota: Orangutan asesino",
    descripcion: "Ganas prestigio, eres famoso",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🦧",
    
    
        frasesFinalLectura: [
      "uh uh uhhhhh"
        
    ],
    efectos: {
      prestigio: 2500,
      fuerza: 3
      
      

    }
  },

  {
    id: "t-rex",
    titulo: "Mascota: T-Rex simpatico",
    descripcion: "Ganas prestigio, eres famoso",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🦖",
            frasesFinalLectura: [
     "grrrrrrrrrrrrr",
              "sniff",
              "wooooooooooooo",
              "burrrrrrrrrrrr"
    ],
    efectos: {
      prestigio: 2500,
      fuerza: 3
    }
  },

  {
    id: "racoon",
    titulo: "Mascota: Rocket Raccoon",
    descripcion: "Ganas prestigio, esta muy chulo",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🦝",
            frasesFinalLectura: [
      "!Nosotros somos los malditos Guardianes de la Galaxia!",
              "!NO SOY UN MAPACHE!",
              "¡Necesito el ojo de ese tipo!",
              
    ],
    efectos: {
      prestigio: 1500,
      fuerza: 3
    }
  },

  {
    id: "robot",
    titulo: "Mascota: Maximus Prime",
    descripcion: "Ganas prestigio, esta muy chulo",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🤖",
            frasesFinalLectura: [
      "soy maximus prime!",
              "¡Ch-ch-ch-ch-ch-k-k-k!",
              "Autobots, ¡avancen!",
              "El destino rara vez nos llama en el momento que elegimos." ,
              
    ],
    efectos: {
      prestigio: 1500,
      fuerza: 3
    }
  },

  {
    id: "vampiro",
    titulo: "Seguidor: Dracula",
    descripcion: "Ganas prestigio, esta muy chulo",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🧛",
            frasesFinalLectura: [
    "Interesante... aunque esperaba un poco más de sangre.",
      "Otra lectura terminada. Brindo por ti... yo pongo la sangre, digo el vino...",
      "Has sobrevivido a otro libro. Una habilidad admirable para un mortal.",
      "Yo habría leído más rápido, pero los vampiros tenemos horarios complicados.",
      "Excelente. Ahora apaga la luz y empecemos otro."
    ],
    efectos: {
      prestigio: 1500,
      fuerza: 1,
      corazon: -2
    }
  },

  {
    id: "elfo",
    titulo: "Seguidor: Legolas",
    descripcion: "Ganas prestigio, esta muy chulo",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🧝",
            frasesFinalLectura: [
      "Una lectura digna de las canciones de los elfos.",
      "He visto muchas cosas en mis largos años... pero este final me sorprendió.",
      "Otro libro completado. Tus ojos son rápidos, humano.",
      "Podría haber terminado este libro en menos tiempo... pero no presumiré.",
      "Una historia termina. Otra aventura nos espera."
    ],
    efectos: {
      prestigio: 1500,
      agilidad: 2
    }
  },

  {
    id: "luis",
    titulo: "Seguidor: luis pitufo gruñon",
    descripcion: "Pierdes prestigio y cordura",
    rareza: "raro",
    tipo: "activo",
    categoria: "seguidor",
    duracion: null,
    icono: "🤬",
            frasesFinalLectura: [
          "Pues a mí no me ha gustado.",
      "¿Ya está? Menuda pérdida de tiempo.",
      "He leído cosas peores. Pero pocas.",
      "Otro libro terminado... fantástico. Qué emocionante.",
      "Espero que el siguiente sea mejor. Aunque lo dudo."
    ],
    efectos: {
      prestigio: -1500,
      mente: -1
    }
  }
];

// 🟡 Objetos legendarios
export const OBJETOS_LEGENDARIOS = [
  {
    id: "capa_invisibilidad",
    titulo: "Capa de invisibilidad de Harry Potter",
    descripcion: "Capa de invisibilidad de mago enterao",
    rareza: "legendario",
    tipo: "pasivo",
    duracion: null,
    icono: "🧥",
    efectos: {
      multiplicadorXP: 1.2
    }
  },

  {
    id: "grimorio_eterno",
    titulo: "Grimorio Eterno",
    descripcion: "Duplica la XP de los retos completados",
    multiplicadorXP: 2,
    rareza: "legendario"
  },
  {
    id: "biblioteca_ancestral",
    titulo: "Biblioteca Ancestral",
    descripcion: "Otorga prestigio adicional por cada reto",
    bonusPrestigio: 500,
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
  {
  id: "pipa_bilbo",
  titulo: "La pipa de Bilbo",
  descripcion: "Aumenta la mente del lector sabio",
  rareza: "legendario",
  tipo: "pasivo",
  duracion: null,
  icono: "🚬",
  efectos: {
    mente: 2
  }
},
  {
  id: "tiara_donut",
  titulo: "La tiara de Donut",
  descripcion: "Aumenta el nivel del portador a nivel legendario",
  rareza: "legendario",
  tipo: "pasivo",
  duracion: null,
  icono: "🚬",
  efectos: {
    mente: 50,
    fuerza: 50,
    inteligencia: 50,

  }
},

  "eBook de Mithril",
  "Gafas de lectura Jhony N5",
  "Espada de Gandalf",
  "Armadura de páginas de la primera Biblia"
];

export const LOGROS1 = [
  // ======================
  // 🌱 MICRO-LOGROS (todos ganan algo)
  // ======================

  {
    id: "primer_libro",
    titulo: "Primer capítulo",
    descripcion: "Completaste tu primera lectura",
    tipo: "micro",
    icono: "📘",
    condicion: (stats) => stats.totalLibros >= 1
  },

  {
    id: "primera_resena",
    titulo: "Opinión propia",
    descripcion: "Escribiste tu primera reseña",
    tipo: "micro",
    icono: "✍️",
    condicion: (stats) => stats.totalResenas >= 1
  },

  {
    id: "racha_3_dias",
    titulo: "Constancia",
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
    titulo: "Lector incansable",
    descripcion: "Completaste 10 libros",
    tipo: "normal",
    icono: "📚",
    condicion: (stats) => stats.totalLibros >= 10
  },

  {
    id: "tocho_1000",
    titulo: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    tipo: "normal",
    icono: "📖",
    condicion: (l) => l.paginas >= 1000
  },

  {
    id: "nocturno",
    titulo: "Lector/a nocturno",
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
    titulo: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    tipo: "normal",
    icono: "❤️",
    condicion: (l) => l.categoria?.toLowerCase().includes("romance")
  },

  {
    id: "erotico",
    titulo: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    tipo: "normal",
    icono: "🔥",
    condicion: (l) => l.categoria?.toLowerCase().includes("erótico")
  },

  {
    id: "fantasia",
    titulo: "Soñador/a empedernido",
    descripcion: "Leíste literatura fantástica",
    tipo: "normal",
    icono: "🐉",
    condicion: (l) => l.categoria?.toLowerCase().includes("fantasia")
  },

  {
    id: "cf",
    titulo: "Mente científica",
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
    titulo: "Crítico literario ⭐⭐⭐⭐½",
    descripcion: "Diste una valoración media superior a 4,5",
    tipo: "especial",
    icono: "⭐",
    condicion: (stats) => stats.mediaValoraciones >= 4.5
  },

  {
    id: "devorador_anual",
    titulo: "Devorador/a de bibliotecas",
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
    titulo: "Velocidad lectora",
    descripcion: "Fuiste el primero/a en completar un reto",
    tipo: "competitivo",
    icono: "⚡",
    condicion: (reto) => reto.posicion === 1
  },

  {
    id: "campeon_retros",
    titulo: "Campeón/a de los retos",
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
//    titulo: "Primer capítulo",
//    descripcion: "Completa tu primera lectura"
//  },
//  {
//    id: "lector_incansable",
//    titulo: "Lector incansable",
//    descripcion: "Completa 10 libros"
//  },
//  {
//    id: "heroe_del_reto",
//    titulo: "Héroe del reto",
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

// ======================
// 🏆 LOGROS Y RECOMPENSAS
// ======================

// Función auxiliar para normalizar categorías
function normalizarGenero(cat) {
  return cat
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Cada logro tiene: id, titulo, descripcion, tipo, icono, condicion (lectura o stats)
// y opcionalmente efectos extra sobre las características
export const LOGROS = [
  // ======================
  // 🌱 MICRO-LOGROS (todos ganan algo)
  // ======================
  {
    id: "primer_libro",
    titulo: "Primer capítulo",
    descripcion: "Completaste tu primera lectura",
    tipo: "micro",
    icono: "📘",
    condicion: (l) => l && l.finalizada === true,
    efectos: { prestigio: 50, monedas: 5 }
  },
  {
    id: "primera_resena",
    titulo: "Opinión propia",
    descripcion: "Escribiste tu primera reseña",
    tipo: "micro",
    icono: "✍️",
    condicion: (stats) => stats.totalResenas >= 1,
    efectos: { prestigio: 50 }
  },
  {
    id: "racha_3_dias",
    titulo: "Constancia",
    descripcion: "Leíste 3 días seguidos",
    tipo: "micro",
    icono: "🔥",
    condicion: (stats) => stats.rachaDias >= 3,
    efectos: { monedas: 10 }
  },

  // ======================
  // 📚 LOGROS NORMALES POR ESTADÍSTICAS
  // ======================
  {
    id: "lector_incansable",
    titulo: "Lector incansable",
    descripcion: "Completaste 10 libros",
    tipo: "normal",
    icono: "📚",
    condicion: (stats) => stats.totalLibros >= 10,
    efectos: { prestigio: 100 }
  },
  {
    id: "tocho_1000",
    titulo: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    tipo: "normal",
    icono: "📖",
    condicion: (l) => l.paginas >= 1000  && !l.activa,
    efectos: { prestigio: 500 }
  },

  // ======================
  // 🎭 LOGROS POR GÉNERO (y características)
  // ======================
  {
    id: "romantico",
    titulo: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    tipo: "normal",
    icono: "❤️",
    condicion: (l) => {
      const cat = normalizarGenero(l.categoria);
      return cat?.includes("romance") || cat?.includes("amor") || cat?.includes("erotico") || cat?.includes("romant")  && !l.activa;
    },
    efectos: { corazon: 1 } // +1 a la característica corazon
  },
  {
    id: "erotico",
    titulo: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    tipo: "normal",
    icono: "🔥",
    condicion: (l) => normalizarGenero(l.categoria)?.includes("erotico")  && !l.activa,
    efectos: { corazon: 1 }
  },
  {
    id: "fantasia",
    titulo: "Soñador/a empedernido",
    descripcion: "Leíste literatura fantástica",
    tipo: "normal",
    icono: "🐉",
    condicion: (l) => normalizarGenero(l.categoria)?.includes("fantasia") && !l.activa,
  },
  {
    id: "cf",
    titulo: "Mente científica",
    descripcion: "Leíste ciencia ficción",
    tipo: "normal",
    icono: "🧪",
    condicion: (l) => normalizarGenero(l.categoria)?.includes("ciencia ficcion")&& !l.activa,
    efectos: { mente: 1 } // +1 a la característica mente
  },

  {
    id: "terror",
    titulo: "Mal rollito - Leíste un libro de terror",
    descripcion: "Leíste un libro de terror",
    condicion: (l) => normalizarGenero(l.categoria)?.includes("terror") && !l.activa,
    efectos: { mente: -1 } // +1 a la característica mente
  },

  // ======================
  // ⭐ LOGROS ESPECIALES
  // ======================
  {
    id: "critico_literario_happy",
    titulo: "Crítico literario Happy ⭐⭐⭐⭐",
    descripcion: "Diste una valoración media superior a 4,5",
    tipo: "especial",
    icono: "⭐",
    condicion: (stats) => stats.mediaValoraciones >= 4.5,
    efectos: { prestigio: 50 }
  },
    {
      id: "critico_literario_hater",
    titulo: "Crítico literario hater ⭐",
    descripcion: "Diste una valoración media inferior a 1,5",
    tipo: "especial",
    icono: "⭐",
    condicion: (stats) => stats.mediaValoraciones <= 1.5,
    efectos: { prestigio: 50 }
  },

  {
    id: "devorador_anual",
    titulo: "Devorador/a de bibliotecas",
    descripcion: "Leíste 30 libros en un año",
    tipo: "especial",
    icono: "🏛️",
    condicion: (stats) => stats.librosAnio >= 30,
    efectos: { xp: 500 }
  },

  // ======================
  // 🏆 RETOS MENSUALES
  // ======================
  {
    id: "reto_actual",
    titulo: "Reto del mes superado",
    descripcion: "Completaste el reto mensual",
    tipo: "reto",
    icono: "🏆",
    condicion: (l) => l.esReto && !l.activa,
    efectos: { xp: 50, monedas: 25, prestigio: 100 }
  }
];

export function obtenerFraseSeguidor(seguidor) {

  if (!seguidor?.frasesFinalLectura?.length) {
    return null;
  }

  const indice = Math.floor(
    Math.random() * seguidor.frasesFinalLectura.length
  );

  return seguidor.frasesFinalLectura[indice];
}
