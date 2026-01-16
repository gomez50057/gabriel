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
    image: "/img/caseStudy/biblioteca-digital-planeacion.webp",
    category: "Desarrollo Web",
    featuredPosts: true
  },
  {
    name: "Metrópoli: plataforma integral para planeación y coordinación metropolitana",
    description: [
      {
        type: "p",
        text:
          "**Metrópoli** es una herramienta digital integral diseñada para **dar seguimiento, consultar y transparentar** la gestión y los avances en materia de planeación y coordinación metropolitana. Integra información sobre gobernanza e instancias metropolitanas, datos estadísticos y cartográficos, eventos clave y proyectos estratégicos; con enfoque de **visión prospectiva, sostenibilidad y crecimiento responsable**, incorporando participación ciudadana para construir el Hidalgo que se necesita."
      },

      { type: "h2", text: "Contexto y objetivo" },
      {
        type: "p",
        text:
          "Las zonas metropolitanas requieren coordinación intermunicipal e interinstitucional, y normalmente la evidencia de avance (acuerdos, minutas, indicadores, proyectos, eventos) se dispersa en múltiples fuentes. El objetivo del sitio es concentrar esa información en una sola plataforma, con consulta pública y operación interna para mantener el seguimiento actualizado."
      },
      {
        type: "ul",
        items: [
          "Transparentar la gobernanza metropolitana: cómo funcionan las instancias y su integración.",
          "Consolidar información estadística y cartográfica para planeación basada en evidencia.",
          "Dar visibilidad a eventos clave y proyectos estratégicos metropolitanos.",
          "Habilitar seguimiento operativo (acuerdos, minutas y avances) con indicadores y tablero de análisis."
        ]
      },

      { type: "h2", text: "Alcance funcional" },
      {
        type: "h3",
        text: "Parte pública (consulta e información)"
      },
      {
        type: "ul",
        items: [
          "Múltiples páginas informativas por proyecto/tema metropolitano.",
          "Secciones que explican instancias de gobernanza, integración y funcionamiento.",
          "Información estadística y cartográfica para contextualizar problemáticas y decisiones.",
          "Eventos clave y proyectos estratégicos con narrativa y materiales de consulta.",
          "Espacios de participación ciudadana (según aplique)."
        ]
      },

      {
        type: "h3",
        text: "Parte operativa (con backend)"
      },
      {
        type: "ul",
        items: [
          "Registro y actualización de acuerdos de índole metropolitana.",
          "Consulta de minutas vinculadas a acuerdos y seguimiento por periodos.",
          "Carga de avances en diferentes formatos (por ejemplo: texto, archivos o evidencias).",
          "Dashboard para simplificar el análisis de indicadores asociados a los acuerdos."
        ]
      },

      { type: "h2", text: "Stack y arquitectura" },
      {
        type: "p",
        text:
          "La solución se implementó como una plataforma **full stack**: frontend con `Next.js` y `CSS Modules`, y backend con `Django` (Python) y base de datos `PostgreSQL`. Esta combinación permite entregar una experiencia pública rápida y bien estructurada, y al mismo tiempo operar un módulo administrativo confiable para mantener la información actualizada."
      },
      {
        type: "ul",
        items: [
          "**Frontend:** `Next.js` para enrutamiento, estructura modular, rendimiento y escalabilidad de contenido.",
          "**Estilos:** `CSS Modules` para encapsular estilos por componente y facilitar mantenimiento en un sitio con muchas secciones.",
          "**Backend:** `Django` (Python) por su solidez en administración, autenticación/autorización y construcción de APIs.",
          "**DB:** `PostgreSQL` por integridad relacional, consultas consistentes y crecimiento ordenado de datos (acuerdos, minutas, avances, indicadores)."
        ]
      },

      { type: "h2", text: "Decisiones técnicas (justificación)" },
      {
        type: "ul",
        items: [
          "**Next.js**: adecuado para plataformas institucionales con muchas páginas y contenido; facilita estructura, performance y evolución del sitio.",
          "**Django**: reduce riesgo en operación interna (panel, roles, validaciones); acelera desarrollo de CRUDs y flujos administrativos.",
          "**PostgreSQL**: ideal para modelar relaciones (acuerdo ↔ minuta ↔ avance ↔ indicador), garantizando consistencia y trazabilidad.",
          "**Separación público/privado**: la parte pública se optimiza para consulta; la parte privada prioriza control, seguridad y actualización continua."
        ]
      },

      { type: "h2", text: "Modelo conceptual de datos (referencia)" },
      {
        type: "p",
        text:
          "A nivel conceptual, los acuerdos se relacionan con minutas y avances; y se evalúan mediante indicadores. Esto habilita un tablero que resume estado y progreso sin perder trazabilidad documental."
      },


      { type: "h2", text: "Dashboard e interpretación de indicadores" },
      {
        type: "p",
        text:
          "El dashboard consolida indicadores por acuerdo y por zona metropolitana para facilitar lectura ejecutiva: estado, tendencia, cortes de información y evidencia asociada. Esto permite pasar de un seguimiento documental a un seguimiento con **señales cuantificables**."
      },

      { type: "h2", text: "Seguridad y control" },
      {
        type: "ul",
        items: [
          "Acceso restringido para operación interna (roles/permisos).",
          "Validación de datos del lado servidor para consistencia y trazabilidad.",
          "Separación clara entre contenido público y procesos administrativos."
        ]
      },

      { type: "h2", text: "Impacto" },
      {
        type: "ul",
        items: [
          "Transparencia y consulta centralizada sobre coordinación metropolitana en Hidalgo.",
          "Seguimiento operativo de acuerdos con evidencia (minutas/avances) e indicadores.",
          "Base escalable para incorporar más zonas, proyectos, capas de información y participación ciudadana."
        ]
      }
    ],
    date: "14 de enero, 2026",
    image: "/img/caseStudy/metropoli-plataforma.webp",
    category: "Desarrollo Web",
    featuredPosts: true
  },
  {
    name: "Plan Hídrico del Valle del Mezquital: difusión, participación y gestión de aportaciones",
    description: [
      {
        type: "p",
        text:
          "La **Plataforma del Plan Hídrico del Valle del Mezquital** difunde información sobre los componentes, desafíos y avances del Plan Hídrico, promoviendo una gestión **sostenible, integrada, participativa y consciente** del recurso hídrico en la región. Es un espacio público de consulta y participación, con un módulo privado para **registro, análisis y dictamen** de aportaciones ciudadanas y reporteo de datos."
      },
      {
        type: "p",
        text:
          "Bajo el mensaje **“Transformando el Futuro con Agua”**, el proyecto impulsa una visión hídrica para el Valle del Mezquital alineada a una estrategia integral y centrada en el bienestar, articulada en cuatro ejes: **acceso universal al agua potable, saneamiento responsable, prevención de riesgos por inundaciones y modernización del riego agrícola**."
      },

      { type: "h2", text: "Contexto y objetivo" },
      {
        type: "p",
        text:
          "El objetivo de la plataforma es convertir la información del Plan en una experiencia accesible y accionable para la población: explicar el enfoque, mostrar avances y habilitar mecanismos reales de participación mediante aportaciones documentales. Esto combina difusión institucional con una operación interna que permite validar, analizar y sistematizar lo que la ciudadanía comparte."
      },
      {
        type: "ul",
        items: [
          "Difundir componentes, retos y avances del Plan Hídrico del Valle del Mezquital.",
          "Promover participación: recibir y gestionar aportaciones documentales de la población.",
          "Publicar documentos seleccionados para fortalecer la cultura hídrica y la planeación.",
          "Habilitar operación interna: análisis/dictamen, reportes e exportación de datos."
        ]
      },

      { type: "h2", text: "Ejes del Plan (estructura conceptual)" },
      {
        type: "ul",
        items: [
          "Acceso universal al agua potable.",
          "Saneamiento responsable.",
          "Prevención de riesgos por inundaciones.",
          "Modernización del riego agrícola."
        ]
      },

      { type: "h2", text: "Arquitectura del sitio (secciones principales)" },

      { type: "h3", text: "Ecos del Territorio Hídrico (participación ciudadana)" },
      {
        type: "p",
        text:
          "Sección creada para que la población comparta conocimiento: **artículos de opinión, ensayos, estudios independientes, relatos comunitarios** y expresiones escritas que enriquezcan el Plan. El usuario llena un formulario y sube un documento; el sistema registra la solicitud y permite su **validación** antes de publicarse o gestionarse internamente."
      },
      {
        type: "ul",
        items: [
          "Formulario público para recepción de aportaciones.",
          "Carga de archivo y metadatos (autoría, tema, descripción).",
          "Registro en base de datos para seguimiento y control.",
          "Validación/flujo interno antes de disponibilidad o difusión."
        ]
      },

      { type: "h3", text: "Planeación para el Futuro del Agua (consulta documental)" },
      {
        type: "p",
        text:
          "Espacio donde convergen estrategias, políticas públicas y acciones para una gestión integral y eficiente. Incluye documentos seleccionados para contextualizar el tema y fortalecer el compromiso por un futuro donde el agua sea motor de bienestar, equidad y resiliencia. Se invita a la población a compartir documentos a través de la sección de participación."
      },
      {
        type: "ul",
        items: [
          "Repositorio curado de documentos y materiales de referencia.",
          "Navegación por temas/ejes y consulta simplificada.",
          "Llamado a la participación para contribuir con documentos propios."
        ]
      },

      { type: "h3", text: "Capacitaciones (tutoriales y actividades)" },
      {
        type: "p",
        text:
          "Apartado de capacitación para publicar **tutoriales y actividades** (por ejemplo, contenidos vinculados a riego u operación comunitaria), buscando fortalecer capacidades y prácticas sostenibles. Se organiza para consulta abierta y crecimiento gradual de contenidos."
      },
      {
        type: "ul",
        items: [
          "Publicación de tutoriales y materiales de capacitación.",
          "Organización por categorías o ejes temáticos.",
          "Contenido orientado a aplicación práctica (aprendizaje accionable)."
        ]
      },

      { type: "h2", text: "Módulo privado (operación interna)" },
      {
        type: "p",
        text:
          "La plataforma incluye una sección privada con acceso para registrar, revisar y dictaminar solicitudes. Esta capa permite convertir la participación en información gestionable: control de estatus, comentarios internos y generación de salidas para análisis institucional."
      },
      {
        type: "ul",
        items: [
          "Registro y seguimiento de solicitudes (estatus, dictamen, observaciones).",
          "Revisión del documento cargado y metadatos asociados.",
          "Impresión de reportes y descarga/exportación a `Excel` de la información recabada.",
          "Vista de análisis para organizar la evidencia y facilitar decisiones."
        ]
      },

      { type: "h2", text: "Stack y decisiones técnicas (justificación)" },
      {
        type: "p",
        text:
          "Se implementó como plataforma **full stack** para equilibrar difusión pública y operación interna. El frontend se desarrolló con `Next.js` y `CSS Modules` para asegurar rendimiento y mantenibilidad en múltiples páginas y secciones. El backend se construyó con `Django` (Python) y `PostgreSQL` para gestionar formularios, carga de archivos, validación y reporteo de datos con consistencia."
      },
      {
        type: "ul",
        items: [
          "**Next.js (Frontend):** ideal para un sitio con múltiples páginas informativas, navegación estructurada y experiencia rápida de consulta.",
          "**CSS Modules:** estilos encapsulados por componente, evitando colisiones y facilitando escalamiento visual del sitio.",
          "**Django (Backend):** robusto para flujos administrativos (auth/roles), validaciones y APIs para formularios y gestión de solicitudes.",
          "**PostgreSQL (DB):** integridad relacional para modelar solicitudes, documentos, estatus, dictámenes y auditoría básica."
        ]
      },

      { type: "h2", text: "Flujo de participación (alto nivel)" },
      {
        type: "ul",
        items: [
          "Usuario llena formulario en **Ecos del Territorio Hídrico** y sube documento.",
          "Backend registra solicitud y archivo; asigna estatus inicial.",
          "Equipo interno revisa, valida y emite dictamen desde el módulo privado.",
          "La información se consolida para reportes (impresión y exportación a Excel)."
        ]
      },

      { type: "h2", text: "Modelo conceptual de datos (referencia)" },
      {
        type: "p",
        text:
          "El núcleo se centra en solicitudes ciudadanas con archivo, metadatos y dictamen. Esto permite trazabilidad y explotación posterior (reportes, filtros, estadísticas)."
      },

      { type: "h2", text: "Seguridad y control" },
      {
        type: "ul",
        items: [
          "Separación clara entre consulta pública y operación interna (acceso restringido).",
          "Validación del lado servidor para datos del formulario y control de archivos.",
          "Trazabilidad por estatus/dictamen para evitar publicaciones no validadas."
        ]
      },

      { type: "h2", text: "Impacto" },
      {
        type: "ul",
        items: [
          "Difusión clara y estructurada del Plan Hídrico y sus ejes estratégicos.",
          "Participación ciudadana habilitada con flujo real de recepción y validación de documentos.",
          "Información sistematizada para análisis institucional mediante reportes y exportación.",
          "Base escalable para incorporar más contenidos, capacitaciones y métricas de participación."
        ]
      }
    ],
    date: "14 de enero, 2026",
    image: "/img/caseStudy/plan-hidrico-mezquital.webp",
    category: "Desarrollo Web",
    featuredPosts: true
  },
];