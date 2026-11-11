/* =====================================================================
   CORPORACIÓN GLAESEL · SAFETY FIRST — DATOS DE LA PÁGINA
   ---------------------------------------------------------------------
   Aquí se cambia todo sin saber programar. Copia un bloque { ... },
   pégalo y cambia los datos.

   - Servicios, cursos, productos, misión, visión, historia, contactos,
     aliados y clientes salen de "Presentacion General CGSA.pdf".
   - LOS PRECIOS DE LA TIENDA SON DE PRUEBA.
   - Las fotos de producto en media/productos/ son de IA (Gemini): cámbialas
     por fotos reales con el mismo nombre de archivo.
   - Todo lo que dice CONFIRMAR hay que revisarlo con la empresa.

   Campos de cada producto:
     id, nombre, desc, precio (o opciones), etiqueta (opcional)
     categoria → extintores | recargas | botiquines | epp | prehospitalario | rescate
     foto      → "fotos/mi-foto.jpg"  (o null para usar el dibujo)
     icono     → dibujo que se usa si no hay foto:
                 extintor | co2 | espuma | recarga | botiquin | casco | lentes |
                 orejeras | guantes | chaleco | arnes | mochila | camilla |
                 collarin | oximetro | cuerda | supresion
   ===================================================================== */

const TIENDA = {
  nombre: "Corporación Glaesel",
  marca: "Safety First",
  lema: "Todo en uno en salud y seguridad ocupacional",
  desde: 2009,
  telefono: "3993 1999",
  whatsapp: "50239931999",           // 502 + número, sin espacios. "" = se oculta (CONFIRMAR que tiene WhatsApp)
  correo: "alex.glaesel@glaeselsa.com",
  direccion: "Ciudad de Guatemala",   // CONFIRMAR dirección de la oficina
  // Horario de oficina. 0 = domingo, null = cerrado (CONFIRMAR)
  horario: { 0: null, 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17], 6: [8, 12] },
  sedes: [],
  contactos: [
    { nombre: "Alex Glaesel", cargo: "Director Comercial", correo: "alex.glaesel@glaeselsa.com", telefono: "3993 1999" },
    { nombre: "Viviana Castillo", cargo: "Directora Administrativa", correo: "viviana.glaesel@glaeselsa.com", telefono: "4545 4557" }
  ]
};

/* Videos e imágenes de la página. Están en la carpeta media/ (ver media/PENDIENTE-MEDIA.md).
   Deja un video en "" para que solo se vea la foto. */
const MEDIA = {
  heroVideo: "media/hero.mp4",              // 16:9, 7 s, en bucle (Mixkit, uso comercial libre)
  heroVideoMovil: "media/hero-movil.mp4",   // 9:16 para celular
  heroFoto: "media/hero-video-poster.jpg",  // primer cuadro del video: se ve mientras carga, sin salto
  heroFotoMovil: "media/hero-movil-video-poster.jpg",
  ctaVideo: "media/cta.mp4",                // brasas rojas sobre negro, en bucle
  ctaFoto: "media/cta-poster.jpg"
};

const MISION = "Garantizar la seguridad y salud de los colaboradores de nuestros clientes por medio de la integración de los servicios más innovadores y productos que cumplan con los más altos estándares de calidad en Guatemala, ajustándonos a las necesidades y requerimientos de nuestros clientes.";
const VISION = "Ser la mejor empresa “todo en uno” en las industrias de salud y seguridad ocupacional, mediante nuestras empresas hermanas y alianzas estratégicas, para integrar todos los servicios y productos asociados a garantizar la vida, seguridad y salud de los guatemaltecos.";

/* Las 4 áreas de servicio (tarjetas grandes con foto) */
const SERVICIOS = [
  { id: "consultoria", nombre: "Asesoría y gestión SSO", foto: "fotos/supervisor-sso.jpg",
    txt: "Cumple con el Ministerio de Trabajo y con las normas nacionales e internacionales.",
    items: ["Asesoría y consultoría en Salud y Seguridad Ocupacional", "Elaboración e implementación de Planes de SSO", "Matrices de riesgo", "Diagnósticos y auditorías de SSO", "Planes de Emergencia y Evacuación"] },
  { id: "prehospitalaria", nombre: "Atención prehospitalaria", foto: "fotos/ambulancia-equipo.jpg",
    txt: "Ambulancia, paramédicos y médicos en tu planta, obra o evento.",
    items: ["Ambulancia, paramédicos y médicos en sitio", "Servicio de atención prehospitalaria", "Cobertura de eventos bajo normativas de CONRED", "Outsourcing de técnicos en urgencias médicas y paramédicos"] },
  { id: "emergencias", nombre: "Respuesta a emergencias", foto: "fotos/bomberos-incendio.jpg",
    txt: "Personal y equipo para incendios industriales y rescate.",
    items: ["Respuesta a incendios industriales de grandes proporciones", "Servicio de búsqueda y rescate aéreo", "Equipos de supresión de incendios para distintas industrias"] },
  { id: "outsourcing", nombre: "Personal SSO en tu empresa", foto: "fotos/trabajo-alturas.jpg",
    txt: "Profesionales de seguridad que trabajan dentro de tu operación.",
    items: ["Outsourcing de monitores SSO", "Outsourcing de supervisores SSO", "Outsourcing de técnicos en urgencias médicas y paramédicos"] }
];

/* Cursos y talleres. area: "sso" (seguridad ocupacional) o "emergencias" */
const CURSOS = [
  { area: "sso", nombre: "Curso para Monitores en Salud y Seguridad Ocupacional", destacado: true },
  { area: "sso", nombre: "Trabajo en alturas", destacado: true },
  { area: "sso", nombre: "Trabajo con andamios" },
  { area: "sso", nombre: "Trabajo en espacios confinados", destacado: true },
  { area: "sso", nombre: "Maniobras con grúas e izaje de cargas" },
  { area: "sso", nombre: "Trabajo en caliente" },
  { area: "sso", nombre: "Trabajo con herramientas y equipos" },
  { area: "sso", nombre: "Uso y normativas de Equipo de Protección Personal" },
  { area: "sso", nombre: "Trabajos eléctricos" },
  { area: "sso", nombre: "Gestión y administración de permisos de trabajo y ATS" },
  { area: "sso", nombre: "Elaboración y ejecución de matrices de riesgo" },
  { area: "sso", nombre: "Gestión y prevención de riesgos laborales" },
  { area: "sso", nombre: "Almacenaje y manejo de productos peligrosos" },
  { area: "sso", nombre: "Investigación de accidentes" },
  { area: "sso", nombre: "Fundamentos y leyes locales de Salud y Seguridad Ocupacional" },
  { area: "emergencias", nombre: "Primeros auxilios básicos y avanzados", destacado: true },
  { area: "emergencias", nombre: "Brigadas de emergencia", destacado: true },
  { area: "emergencias", nombre: "Búsqueda y rescate" },
  { area: "emergencias", nombre: "Bomberos industriales", destacado: true },
  { area: "emergencias", nombre: "Bomberos forestales" },
  { area: "emergencias", nombre: "Primera respuesta en incidentes con materiales peligrosos" },
  { area: "emergencias", nombre: "Sistema de Comando de Incidentes" },
  { area: "emergencias", nombre: "Administración de emergencias" }
];
const AVALES = ["Instructores registrados en el MinTrab", "Bomberos industriales avalados por Williams Fire and Hazard Control", "y por TEEX de la Universidad de Texas A&M"];

/* Diagnóstico rápido: cada pregunta "No" recomienda un servicio.
   Es orientativo, no sustituye un diagnóstico o auditoría formal. */
const DIAGNOSTICO = [
  { q: "¿Tu empresa tiene un Plan de Salud y Seguridad Ocupacional por escrito y actualizado?", rec: "Elaboración e implementación de Plan de SSO" },
  { q: "¿Tienen una matriz de riesgos de todos los puestos de trabajo?", rec: "Elaboración de matrices de riesgo" },
  { q: "¿Cuentan con un Plan de Emergencia y Evacuación y lo practican con simulacros?", rec: "Plan de Emergencia y Evacuación" },
  { q: "¿Tienen una brigada de emergencia capacitada?", rec: "Capacitación de Brigadas de Emergencia" },
  { q: "¿Los extintores tienen la recarga y el mantenimiento al día?", rec: "Recarga y mantenimiento de extintores" },
  { q: "¿Tienen botiquines completos en cada área?", rec: "Botiquines según el Acuerdo Gubernativo 229-2014" },
  { q: "¿Quienes hacen trabajos de riesgo (alturas, espacios confinados, en caliente) están capacitados?", rec: "Cursos de trabajo de alto riesgo" },
  { q: "¿Cuentan con personal de SSO (monitor o supervisor) en sus operaciones?", rec: "Outsourcing de monitores o supervisores SSO" }
];

/* Empresas hermanas y alianzas (logos en la carpeta logos/) */
const ALIADOS = [
  { nombre: "Safety First", logo: "logos/safety-first.png" },
  { nombre: "S.O.S. Extintores", logo: "logos/aliado-sos-extintores.png" },
  { nombre: "Aero Ambulancia", logo: "logos/aliado-aero-ambulancia.png" },
  { nombre: "FCA Fire Consulting", logo: "logos/aliado-fca.png" },
  { nombre: "Black Wolf · Helicopter Special Operations", logo: "logos/aliado-black-wolf.png" },
  { nombre: "Quick Assist", logo: "logos/aliado-quick-assist.png" },
  { nombre: "MAP", logo: "logos/aliado-map.png" },
  { nombre: "Safe!Side", logo: "logos/aliado-safeside.png" },
  { nombre: "Camp180", logo: "logos/aliado-camp180.png" }
];

/* Algunos clientes (de la presentación). Pedir permiso antes de publicar. */
const CLIENTES = ["cmi", "disagro", "cbc", "hpc", "spectrum", "tecnoparques", "miraflores", "naranjo-mall", "oakland-place", "portales",
  "zona-portales", "la-pradera", "zona-pradera", "navitta", "envia", "zigo", "tecnifibras", "grupo-secacao", "donde-mikel", "show-business", "synergy"]
  .map(c => "logos/cliente-" + c + ".png");

const ENTREGA = {
  domicilio: { activo: true, costo: 0, minimo: 300, gratisDesde: 0, etiqueta: "Entrega en tu empresa", detalle: "Ciudad de Guatemala (CONFIRMAR cobertura)" },
  recoger: { activo: true, etiqueta: "Recoger en oficina", detalle: "Sin costo · CONFIRMAR dirección" },
  zonas: ["Zona 1", "Zona 4", "Zona 9", "Zona 10", "Zona 11", "Zona 12", "Zona 13", "Zona 14", "Zona 15", "Mixco", "Villa Nueva", "Carretera a El Salvador", "Otra (consultar cobertura)"],
  anticipacionHoras: 24,
  diasCerrado: [0],
  franjas: ["8:00 a 10:00", "10:00 a 12:00", "13:00 a 15:00", "15:00 a 17:00"],
  aviso: "Entregas de lunes a viernes. Para pedidos grandes o empresas, pide una cotización."  // CONFIRMAR
};

const BANCO = { banco: "Banco Industrial", tipo: "Monetaria", cuenta: "000-000000-0", nombre: "Corporación Glaesel, S.A." }; // CONFIRMAR

const CATEGORIAS = { todos: "Todo", extintores: "Extintores", recargas: "Recarga y mantenimiento", botiquines: "Botiquines", epp: "Protección personal", prehospitalario: "Prehospitalario", rescate: "Rescate" };

const PRODUCTOS = [
  /* Extintores */
  { id: "extintor-pqs", nombre: "Extintor de PQS (ABC)", categoria: "extintores", etiqueta: "El más pedido", foto: "media/productos/extintor-pqs.jpg", icono: "extintor",
    desc: "Polvo químico seco para fuegos clase A, B y C. Incluye soporte de pared.",
    opciones: { nombre: "Capacidad", valores: [ { label: "5 lb", precio: 260 }, { label: "10 lb", precio: 385 }, { label: "20 lb", precio: 690 } ] } },
  { id: "extintor-co2", nombre: "Extintor de CO2", categoria: "extintores", foto: "media/productos/extintor-co2.jpg", icono: "co2",
    desc: "Para equipo eléctrico y cuartos de servidores: no deja residuo.",
    opciones: { nombre: "Capacidad", valores: [ { label: "5 lb", precio: 690 }, { label: "10 lb", precio: 990 }, { label: "15 lb", precio: 1290 } ] } },
  { id: "extintor-espuma", nombre: "Extintor de espuma", categoria: "extintores", foto: "media/productos/extintor-espuma.jpg", icono: "espuma",
    desc: "Para líquidos inflamables: combustibles, solventes y aceites.",
    opciones: { nombre: "Capacidad", valores: [ { label: "2.5 galones", precio: 1150 }, { label: "Rodante 33 galones", precio: 8900 } ] } },
  { id: "supresion", nombre: "Equipo de supresión de incendios", categoria: "extintores", etiqueta: "Cotizar", foto: "fotos/remolque-supresion.jpg", icono: "supresion",
    desc: "Sistemas para distintas industrias. Diseñamos según tu riesgo. El precio es un anticipo para la visita técnica.", precio: 500 },

  /* Recarga y mantenimiento */
  { id: "recarga-pqs", nombre: "Recarga de extintor de PQS", categoria: "recargas", etiqueta: "Servicio", foto: "media/productos/recarga.jpg", icono: "recarga",
    desc: "Recarga, revisión de manómetro y marchamo. Recogemos y devolvemos.",
    opciones: { nombre: "Capacidad", valores: [ { label: "5 lb", precio: 65 }, { label: "10 lb", precio: 90 }, { label: "20 lb", precio: 140 } ] } },
  { id: "recarga-co2", nombre: "Recarga de extintor de CO2", categoria: "recargas", foto: "media/productos/recarga.jpg", icono: "recarga",
    desc: "Recarga y revisión de válvula y corneta.",
    opciones: { nombre: "Capacidad", valores: [ { label: "5 lb", precio: 120 }, { label: "10 lb", precio: 160 }, { label: "15 lb", precio: 210 } ] } },
  { id: "recarga-espuma", nombre: "Recarga de extintor de espuma", categoria: "recargas", foto: "media/productos/recarga.jpg", icono: "recarga",
    desc: "Recarga con agente espumante y prueba de funcionamiento.", precio: 240 },
  { id: "mantenimiento", nombre: "Mantenimiento anual de extintores", categoria: "recargas", foto: "media/productos/recarga.jpg", icono: "recarga",
    desc: "Inspección, limpieza, cambio de piezas y etiqueta de servicio. Precio por extintor.", precio: 45 },

  /* Botiquines */
  { id: "botiquin", nombre: "Botiquín de primeros auxilios", categoria: "botiquines", etiqueta: "AG 229-2014", foto: "media/productos/botiquin.jpg", icono: "botiquin",
    desc: "Contenido según el Acuerdo Gubernativo 229-2014. Gabinete de pared o maletín.",
    opciones: { nombre: "Tamaño", valores: [ { label: "Básico · hasta 10 personas", precio: 375 }, { label: "Intermedio · hasta 25 personas", precio: 690 }, { label: "Industrial · hasta 50 personas", precio: 1150 } ] } },
  { id: "reposicion-botiquin", nombre: "Reposición de botiquín", categoria: "botiquines", foto: "media/productos/botiquin.jpg", icono: "botiquin",
    desc: "Revisamos tu botiquín y reponemos lo usado o vencido.", precio: 150 },

  /* Equipo de protección personal */
  { id: "casco", nombre: "Casco de seguridad", categoria: "epp", foto: "media/productos/casco.jpg", icono: "casco",
    desc: "Con suspensión de matraca. Varios colores.",
    opciones: { nombre: "Color", valores: [ { label: "Blanco", precio: 85 }, { label: "Amarillo", precio: 85 }, { label: "Rojo", precio: 85 }, { label: "Azul", precio: 85 } ] } },
  { id: "lentes", nombre: "Lentes de seguridad", categoria: "epp", foto: "media/productos/lentes.jpg", icono: "lentes",
    desc: "Antiempañante y antirrayones.",
    opciones: { nombre: "Mica", valores: [ { label: "Claros", precio: 35 }, { label: "Oscuros", precio: 38 } ] } },
  { id: "orejeras", nombre: "Protección auditiva", categoria: "epp", foto: "media/productos/orejeras.jpg", icono: "orejeras",
    desc: "Orejeras o tapones reutilizables.",
    opciones: { nombre: "Tipo", valores: [ { label: "Orejeras", precio: 120 }, { label: "Tapones · caja de 10 pares", precio: 75 } ] } },
  { id: "guantes", nombre: "Guantes de trabajo", categoria: "epp", foto: "media/productos/guantes.jpg", icono: "guantes",
    desc: "Nitrilo, carnaza o anticorte.",
    opciones: { nombre: "Tipo", valores: [ { label: "Nitrilo", precio: 35 }, { label: "Carnaza", precio: 45 }, { label: "Anticorte", precio: 85 } ] } },
  { id: "chaleco", nombre: "Chaleco reflectivo", categoria: "epp", foto: "media/productos/chaleco.jpg", icono: "chaleco",
    desc: "Alta visibilidad, con cinta reflectiva.", precio: 55 },

  /* Prehospitalario */
  { id: "mochila-trauma", nombre: "Mochila de trauma equipada", categoria: "prehospitalario", etiqueta: "Para brigadas", foto: "media/productos/mochila-trauma.jpg", icono: "mochila",
    desc: "Vendajes, inmovilización, control de hemorragias y vía aérea básica.", precio: 1450 },
  { id: "camilla", nombre: "Camilla rígida (tabla espinal)", categoria: "prehospitalario", foto: "media/productos/camilla.jpg", icono: "camilla",
    desc: "Con inmovilizador de cabeza y cinturones de sujeción.", precio: 1350 },
  { id: "collarin", nombre: "Collarín cervical ajustable", categoria: "prehospitalario", foto: "media/productos/collarin.jpg", icono: "collarin",
    desc: "Para adulto, de una pieza.", precio: 95 },
  { id: "oximetro", nombre: "Oxímetro de pulso", categoria: "prehospitalario", foto: "media/productos/oximetro.jpg", icono: "oximetro",
    desc: "Saturación de oxígeno y frecuencia cardiaca.", precio: 225 },

  /* Rescate */
  { id: "arnes", nombre: "Arnés de cuerpo completo", categoria: "rescate", foto: "media/productos/arnes.jpg", icono: "arnes",
    desc: "Para trabajo en alturas, con anillo dorsal.",
    opciones: { nombre: "Tipo", valores: [ { label: "Arnés", precio: 650 }, { label: "Arnés + línea de vida con amortiguador", precio: 1150 } ] } },
  { id: "cuerda", nombre: "Cuerda estática de rescate", categoria: "rescate", foto: "media/productos/cuerda.jpg", icono: "cuerda",
    desc: "Kernmantle de 11 mm.",
    opciones: { nombre: "Largo", valores: [ { label: "30 m", precio: 1150 }, { label: "50 m", precio: 1800 } ] } }
];
