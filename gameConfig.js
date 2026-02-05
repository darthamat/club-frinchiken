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
    descripcion: "Aumenta la XP obtenida durante una semana",
    bonusXP: 0.2,
    rareza: "raro"
  },
  {
    id: "marca_dragon",
    nombre: "Marcapáginas del Dragón",
    descripcion: "Otorga monedas extra al terminar libros",
    bonusMonedas: 10,
    rareza: "raro"
  },


  "Marcapáginas de dragón",
  "Lupa de detective",
  "Pluma encantada",
  "Taza de café mágico",
  "Capa de invisibilidad de biblioteca"

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
    bonusPrestigio: 1,
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

// 🏆 Logros posibles
export const LOGROS = [
  {
    id: "primer_libro",
    nombre: "Primer capítulo",
    descripcion: "Completa tu primera lectura"
  },
  {
    id: "lector_incansable",
    nombre: "Lector incansable",
    descripcion: "Completa 10 libros"
  },
  {
    id: "heroe_del_reto",
    nombre: "Héroe del reto",
    descripcion: "Completa un reto mensual"
  },
    // 🧩 RETOS
  {
    id: "reto_enero",
    titulo: "Reto de Enero superado",
    descripcion: "Completaste el reto mensual",
    tipo: "reto",
    condicion: (_, l) => l?.esReto === true
  },

  // 📚 PÁGINAS
  {
    id: "tocho_1000",
    titulo: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    condicion: (_, l) => l?.paginas >= 1000
  },

  // 📦 GÉNEROS
  {
    id: "romantico",
    titulo: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    condicion: (_, l) => l?.categoria?.toLowerCase().includes("romance")
  },
  {
    id: "erotico",
    titulo: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    condicion: (_, l) => l?.categoria?.toLowerCase().includes("erótico")
  },
   {
    id: "fantasia",
    titulo: "Soñador/a empedernido, un solo mundo no es suficiente",
    descripcion: "Leíste literatura fantástica",
    condicion: (_, l) => l?.categoria?.toLowerCase().includes("fantasia")
  },
   {
    id: "terror",
    titulo: "Mal  rollito por leer libros de miedo de noche",
    descripcion: "Leíste un libro de terror",
    condicion: (l) => l.categoria?.toLowerCase().includes("terror")
  },

  // 🌙 HÁBITOS
  {
    id: "nocturno",
    titulo: "Lector/a nocturno",
    descripcion: "Terminaste un libro entre las 00:00 y las 06:00",
    condicion: (lecturasCache) => {
      const h = new Date().getHours();
      return h >= 0 && h < 6;
    }
  },
{
  id: "mes_10_libros",
  titulo: "Devorador/a de libros",
  condicion: (lecturas) => {
  if (!Array.isArray(lecturas)) return false;

  const ahora = new Date();
  const mes = ahora.getMonth();
  const año = ahora.getFullYear();

  return lecturas.filter(l => {
    if (!l.fechaFin) return false;
    const f = l.fechaFin.toDate();
    return f.getMonth() === mes && f.getFullYear() === año;
  }).length >= 10;
}
},

{
  id: "mes_5_libros",
  titulo: "Super lector/a",
condicion: (lecturas) => {
  if (!Array.isArray(lecturas)) return false;

  const ahora = new Date();
  const mes = ahora.getMonth();
  const año = ahora.getFullYear();

  return lecturas.filter(l => {
    if (!l.fechaFin) return false;
    const f = l.fechaFin.toDate();
    return f.getMonth() === mes && f.getFullYear() === año;
  }).length >= 5;
}
},

{
  id: "anio_20_libros",
  titulo: "Devorador/a de libros",
condicion: (lecturas) => {
  if (!Array.isArray(lecturas)) return false;

  const ahora = new Date();
  const mes = ahora.getMonth();
  const año = ahora.getFullYear();

  return lecturas.filter(l => {
    if (!l.fechaFin) return false;
    const f = l.fechaFin.toDate();
    return f.getMonth() === mes && f.getFullYear() === año;
  }).length >= 20;
}
},

{
  id: "anio_30_libros",
  titulo: "Terror de las bibliotecas",
 condicion: (lecturas) => {
  if (!Array.isArray(lecturas)) return false;

  const ahora = new Date();
  const mes = ahora.getMonth();
  const año = ahora.getFullYear();

  return lecturas.filter(l => {
    if (!l.fechaFin) return false;
    const f = l.fechaFin.toDate();
    return f.getMonth() === mes && f.getFullYear() === año;
  }).length >= 30;
}
}
];
