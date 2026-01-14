export const blogPosts = [
  {
    name: "Biblioteca Digital de Planeación: consulta pública de instrumentos y documentos",
    description: [
      {
        type: "p",
        text:
          "La **Biblioteca Digital de Planeación** es una plataforma pública que permite consultar y descargar, de forma ágil, distintos instrumentos y documentos de planeación: **informes, programas, planes, atlas de riesgo, artículos, guías, lineamientos** y materiales relacionados con procesos de planeación en los diferentes órdenes de gobierno."
      },
      {
        type: "p",
        text:
          "El enfoque principal es **acceso rápido, navegación clara y descarga directa**, para que la población encuentre lo que necesita sin fricción. Con esta biblioteca contribuimos a llevar a Hidalgo a su máximo potencial."
      },

      { type: "h2", text: "Contexto y objetivo" },
      {
        type: "p",
        text:
          "En proyectos de consulta abierta, el reto no es solo “publicar PDFs”, sino habilitar un flujo eficiente: **buscar → filtrar → validar → descargar**; evitando dispersión de fuentes, nomenclaturas inconsistentes y listados poco usables."
      },
      {
        type: "ul",
        items: [
          "Centralizar instrumentos y documentos de planeación en un solo punto.",
          "Mejorar la experiencia de consulta con filtrado por categorías/etiquetas y búsqueda.",
          "Facilitar descarga con metadatos claros (tipo de instrumento, tema, año, fuente, etc.)."
        ]
      },

      { type: "h2", text: "Alcance funcional (MVP)" },
      {
        type: "ul",
        items: [
          "Catálogo público con listados, detalle y enlaces de descarga.",
          "Búsqueda por texto (título, etiquetas, temas) y filtros por categoría.",
          "Interfaz responsiva, pensada para lectura y consulta desde móvil y escritorio.",
          "Estructura modular para crecimiento (nuevas categorías, colecciones y criterios)."
        ]
      },

      { type: "h2", text: "Stack y enfoque de implementación" },
      {
        type: "p",
        text:
          "El proyecto se desarrolló **solo frontend** con `Next.js` (React). El catálogo se gestiona en un archivo `JS` como constante, porque el contenido es de **consulta pública** y no requiere autenticación ni flujos sensibles en la primera etapa."
      },
      {
        type: "ul",
        items: [
          "`Next.js` para estructura de rutas, rendimiento y composición de páginas.",
          "`CSS Modules` para estilos encapsulados y mantenibles.",
          "Catálogo de datos en `JS` (metadatos + links) para despliegues simples y control editorial."
        ]
      },

      { type: "h2", text: "Decisión clave: solo frontend (justificación técnica)" },
      {
        type: "p",
        text:
          "Para un repositorio de **consulta abierta**, arrancar sin backend reduce complejidad e infraestructura: no hay API, base de datos, credenciales ni operación adicional. Esto acelera entrega, simplifica mantenimiento y disminuye puntos de falla."
      },
      {
        type: "ul",
        items: [
          "Contenido público: sin autenticación ni datos personales.",
          "Catálogo estable: altas/bajas puntuales controladas mediante despliegue.",
          "Menos dependencias: operación más simple y robusta.",
          "Base preparada para migrar a backend si el crecimiento lo exige."
        ]
      },

      { type: "h2", text: "Estructura del catálogo (data en constante JS)" },
      {
        type: "p",
        text:
          "El catálogo se mantiene **normalizado** para que la UI consuma un modelo consistente y, si en el futuro se requiere backend, la transición sea directa (mismo contrato de datos)."
      },
      {
        type: "snippet",
        language: "js",
        fileName: "src/utils/biblioteca/bibliotecaData.js",
        code:
          `export const bibliotecaDocs = [
  {
    id: "ped-2025-2028",
    titulo: "Plan Estatal de Desarrollo 2025–2028",
    tipo: "Plan",
    categoria: "Planeación",
    etiquetas: ["Desarrollo", "Estrategia", "Gobierno"],
    anio: 2025,
    fuente: "Institución",
    // Puede ser un PDF en /public, un enlace institucional o un repositorio abierto.
    url: "/docs/planeacion/ped-2025-2028.pdf"
  }
];`
      },

      { type: "h2", text: "Diseño de información (para consulta ágil)" },
      {
        type: "ul",
        items: [
          "Metadatos mínimos pero útiles: tipo, categoría/tema, etiquetas, año, fuente y URL de descarga.",
          "Taxonomía consistente para evitar duplicados (por ejemplo, “Plan” vs “Planes”).",
          "Listados escaneables: título + metadatos + acción de descarga sin pasos innecesarios."
        ]
      },

      { type: "h2", text: "Rendimiento y mantenibilidad" },
      {
        type: "ul",
        items: [
          "Listados y filtros optimizados con memoización para evitar re-renders costosos.",
          "Carga eficiente de recursos (imágenes y elementos no críticos).",
          "Componentes desacoplados: catálogo (data) separado de UI (render).",
          "Preparación para crecimiento: más documentos sin romper estructura."
        ]
      },

      { type: "h2", text: "Evolución prevista (si se requiere backend a futuro)" },
      {
        type: "p",
        text:
          "Si el catálogo crece o se vuelve necesaria una operación editorial (altas/ediciones frecuentes, aprobación, trazabilidad), la evolución natural es incorporar backend sin reescribir la interfaz."
      },
      {
        type: "ul",
        items: [
          "API para CRUD de documentos, categorías y etiquetas.",
          "Persistencia de metadatos (por ejemplo, `PostgreSQL`).",
          "Panel privado con roles/permisos (captura, revisión, publicación).",
          "Bitácora de cambios y versionado (si aplica)."
        ]
      },

      { type: "h2", text: "Impacto" },
      {
        type: "ul",
        items: [
          "Centralización real de instrumentos de planeación en un punto público.",
          "Menos fricción para la población: encontrar y descargar materiales en menos pasos.",
          "Base sólida y escalable: MVP rápido hoy, con ruta clara para backend mañana."
        ]
      }
    ],
    date: "2 de enero, 2026",
    image: "/img/proyectos/biblioteca-digital-planeacion.jpg",
    category: "Desarrollo Web",
    featuredPosts: true
  },
  {
    name: "CSS clamp(): tipografía fluida sin dramas",
    description: [
      { "type": "p", "text": "`clamp()` es uno de los recursos modernos más útiles de CSS. Con una sola línea obtienes texto fluido, legible y controlado en todo rango de pantallas." },

      { "type": "p", "text": "Esta línea dice: “nunca seas más chico que **1.9rem**, intenta ser **3vw** (fluido) y nunca pases de **2.4rem**”." },
      { "type": "snippet", "language": "css", "fileName": "styles.css", "code": "font-size: clamp(1.9rem, 3vw, 2.4rem);" },

      { "type": "h2", "text": "¿Qué es `clamp()`?" },
      { "type": "snippet", "language": "css", "fileName": "Sintaxis", "code": "clamp(MIN, IDEAL, MAX)" },
      { "type": "snippet", "language": "text", "fileName": "Idea", "code": "clamp(a, b, c) = min( max(b, a), c )" },
      { "type": "p", "text": "Traducción: se toma el valor **IDEAL**; si es menor que **MIN**, usa **MIN**; si es mayor que **MAX**, usa **MAX**. Solo acota el valor a un rango lógico." },

      { "type": "h3", "text": "Desglose del ejemplo" },
      { "type": "p", "text": "• **Mínimo:** 1.9rem → garantiza legibilidad.\n• **Fluido:** 3vw → escala con el ancho de pantalla.\n• **Máximo:** 2.4rem → evita tamaños desproporcionados en monitores grandes." },

      { "type": "h3", "text": "¿Cuándo cambia cada tramo?" },
      { "type": "p", "text": "Asumiendo 1rem = 16px: 1.9rem ≈ 30.4px y 2.4rem ≈ 38.4px.\n• Por debajo de ~1013px de ancho, 3vw es menor al mínimo → **1.9rem**.\n• Entre ~1013px y ~1280px, el tamaño fluye con **3vw**.\n• Por encima de ~1280px, se fija en **2.4rem**." },

      { "type": "h3", "text": "Ventajas" },
      { "type": "p", "text": "Reduce media queries, mantiene accesibilidad y ofrece una escala tipográfica predecible entre móvil y desktop." },

      { "type": "h2", "text": "Antes vs. ahora" },
      { "type": "snippet", "language": "css", "fileName": "antes.css", "code": "h2 { font-size: 1.9rem; }\n@media (min-width: 1000px) { h2 { font-size: 3vw; } }\n@media (min-width: 1280px) { h2 { font-size: 2.4rem; } }" },
      { "type": "snippet", "language": "css", "fileName": "ahora.css", "code": "h2 { font-size: clamp(1.9rem, 3vw, 2.4rem); }" },

      { "type": "h3", "text": "Buenas prácticas" },
      { "type": "p", "text": "• Define **MIN y MAX en rem** (accesibilidad).\n• Usa **vw/vh** en el valor central para fluidez.\n• Elige conscientemente: **mínimo legible**, **ideal que escala**, **máximo cómodo**." },

      { "type": "h3", "text": "Recetas listas" },
      { "type": "snippet", "language": "css", "fileName": "patterns.css", "code": "/* Título hero */\n.heroTitle { font-size: clamp(2rem, 6vw, 4rem); }\n\n/* Subtítulo */\n.subTitle { font-size: clamp(1.25rem, 3.5vw, 2rem); }\n\n/* Párrafo base */\n.bodyText { font-size: clamp(1rem, 2.2vw, 1.125rem); }" },

    ],
    date: "13 de noviembre, 2025",
    image: "/img/tutoriales/css-clamp-tipografia.jpg",
    category: "Frontend",
    featuredPosts: true
  }
];