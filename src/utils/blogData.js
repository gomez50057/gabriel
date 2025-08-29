// Negrita: **Este texto estará en negrita**
// Cursiva: *Este texto estará en cursiva*
// Viñetas: * Elemento de lista
// Saltos de línea: \n
// Negrita y Cursiva: **_Este texto estará en negrita y Cursiva_**

import styles from "../components/blog/FullPost.module.css";

export const blogPosts = [
  {
    name: "1 ConCiencia Pública: una agenda de integridad para Hidalgo",
    description: "Presentamos la plataforma que impulsa una administración ética, abierta y cercana a la ciudadanía en el Estado de Hidalgo. \n * **Propósito**: fortalecer la *confianza pública* con acciones medibles. \n  **Recursos prácticos** para dependencias y municipios. \n  **_Enfoque ciudadano_**: lenguaje claro y datos abiertos.",
    date: "18 de agosto, 2025",
    image: "/img/conciencia-publica/lanzamiento-agenda-integridad.png",
    category: "Ética Pública",
    featuredPosts: true
  },
  {
    name: "2 Transparencia proactiva: plantillas y checklist para publicar mejor",
    description: "Ponemos a disposición herramientas listas para usar que facilitan la publicación de información de interés público. \n * **Plantillas** para *organigramas, contratos y presupuestos*. \n * Checklist de **oportunidad, integridad y formato abierto**. \n * **_Ejemplos descargables_** para replicar en tu dependencia.",
    date: "14 de agosto, 2025",
    image: "/img/conciencia-publica/transparencia-proactiva-checklist.png",
    category: "Transparencia",
    featuredPosts: true
  },
  {
    name: "3 Declaraciones de intereses: guía práctica para servidoras y servidores públicos",
    description: "Guía paso a paso para identificar, declarar y gestionar posibles conflictos de interés. \n * **Qué declarar** y *cuándo actualizar*. \n * Matriz para **riesgos comunes**. \n * **_Casos prácticos_** y recomendaciones.",
    date: "12 de agosto, 2025",
    image: "/img/conciencia-publica/guia-declaracion-intereses.png",
    category: "Ética Pública",
    featuredPosts: false
  },
  {
    name: "4 Contrataciones íntegras: 10 señales de alerta en compras públicas",
    description: "Checklist rápido para detectar patrones de riesgo en adquisiciones y obra pública. \n * **Concentración de proveedores** y *plazos atípicos*. \n * Términos **restrictivos** o hechos a la medida. \n * **_Bitácora de verificación_** para cada procedimiento.",
    date: "08 de agosto, 2025",
    image: "/img/conciencia-publica/contrataciones-integras-senales.png",
    category: "Contrataciones Íntegras",
    featuredPosts: true
  },
  {
    name: "Protección de datos personales en trámites digitales",
    description: "Buenas prácticas para cuidar la información de las personas en servicios y ventanillas digitales. \n * **Mínima recolección** y *finalidad específica*. \n * Avisos de **privacidad claros**. \n * **_Cifrado y resguardo_** conforme a mejores prácticas.",
    date: "05 de agosto, 2025",
    image: "/img/conciencia-publica/proteccion-datos-tramites.png",
    category: "Protección de Datos",
    featuredPosts: false
  },
  {
    name: "Cómo presentar una denuncia segura y dar seguimiento",
    description: "Pasos y canales disponibles para reportar irregularidades con acompañamiento. \n * **Rutas confidenciales** y *asesoría inicial*. \n * Estatus y **números de seguimiento**. \n * **_Protección del denunciante_** y medidas de no represalia.",
    date: "01 de agosto, 2025",
    image: "/img/conciencia-publica/denuncia-segura-seguimiento.png",
    category: "Denuncia y Acompañamiento",
    featuredPosts: true
  },
  {
    name: "Participación ciudadana: herramientas para evaluar servicios públicos",
    description: "Formatos y métodos para recibir, procesar y publicar retroalimentación. \n * **Encuestas de salida** y *paneles ciudadanos*. \n * Semáforos de **calidad del servicio**. \n * **_Publicación trimestral_** de resultados.",
    date: "29 de julio, 2025",
    image: "/img/conciencia-publica/participacion-evaluacion-servicios.png",
    category: "Participación Ciudadana",
    featuredPosts: false
  },
  {
    name: "Datos Abiertos Hidalgo: conjuntos prioritarios para vigilancia social",
    description: "Listado inicial de datasets para fortalecer la transparencia activa. \n * **Contratos y proveedores**. \n * *Obra pública* y avances físicos–financieros. \n * **_Indicadores de atención ciudadana_** y tiempos de respuesta.",
    date: "25 de julio, 2025",
    image: "/img/conciencia-publica/datos-abiertos-prioritarios.png",
    category: "Datos Abiertos",
    featuredPosts: true
  },
  {
    name: "Capacitación en ética pública para mandos medios y enlaces",
    description: "Módulos cortos con ejercicios aplicados para equipos en campo y oficina. \n * **Dilemas frecuentes** y *protocolos de actuación*. \n * Roles de **control interno**. \n * **_Evaluaciones rápidas_** por módulo.",
    date: "22 de julio, 2025",
    image: "/img/conciencia-publica/capacitacion-etica-mandos.png",
    category: "Capacitación",
    featuredPosts: false
  },
  {
    name: "Integridad en programas sociales: prevención de conflicto de interés",
    description: "Herramientas para asignación transparente y seguimiento ciudadano. \n * **Criterios públicos** y *padrón verificable*. \n * Cruces contra **registros** y duplicidades. \n * **_Canales de queja_** con respuesta oportuna.",
    date: "18 de julio, 2025",
    image: "/img/conciencia-publica/integridad-programas-sociales.png",
    category: "Rendición de Cuentas",
    featuredPosts: false
  },
  {
    name: "Gobierno Abierto Hidalgo: compromisos locales 2025–2026",
    description: "Agenda colaborativa con metas y responsables por eje. \n * **Transparencia fiscal** y *contrataciones abiertas*. \n * Participación en **planeación urbana**. \n * **_Tecnología cívica_** para reportes y datos en tiempo real.",
    date: "12 de julio, 2025",
    image: "/img/conciencia-publica/gobierno-abierto-compromisos.png",
    category: "Gobierno Abierto",
    featuredPosts: true
  },
  {
    name: "Indicadores de integridad: cómo medir cultura ética en tu dependencia",
    description: "Propuesta de KPIs y tablero de seguimiento trimestral. \n * **Clima ético** y *percepción de conflicto*. \n * Incidencia de **denuncias** y tiempos de atención. \n * **_Cumplimiento_** de obligaciones de transparencia.",
    date: "08 de julio, 2025",
    image: "/img/conciencia-publica/indicadores-integridad.png",
    category: "Evaluación",
    featuredPosts: false
  }
];

export const featuredPosts = [
  {
    name: "9na reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México",
    date: "11 de diciembre, 2024",
    image: "/img/noticias/ZMVM/9na reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México.jpg",
  },
  // {
  //   name: "7ma reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México",
  //   date: "13 de noviembre, 2024",
  //   image: "/img/noticias/ZMVM/7ma reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México.jpg",
  // },
  {
    name: "Red Nacional Metropolitana 2024 Sexta Edición Día 2",
    date: "29 de noviembre, 2024",
    image: "/img/noticias/ZMVM/Red Nacional Metropolitana 2024 Sexta Edición Día 2.jpg"
  },
];

// Función para normalizar nombres (elimina acentos y caracteres especiales)
export const normalizeName = (str) => {
  return str
    .normalize("NFD") // Descompone los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
    .replace(/[^\w\s-]/g, "") // Elimina caracteres especiales
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .toLowerCase(); // Convierte a minúsculas
};

// Función para procesar texto con negritas, cursivas y combinaciones
export const renderTextWithStyles = (text) => {
  const combinedRegex = /(\*\*_(.*?)_\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;

  const elements = [];
  let lastIndex = 0;

  text.replace(combinedRegex, (match, boldItalic, boldItalicContent, bold, boldContent, italic, italicContent, offset) => {
    // Agregar el texto previo a la coincidencia
    if (offset > lastIndex) {
      elements.push(text.substring(lastIndex, offset));
    }

    // Negrita y cursiva
    if (boldItalicContent) {
      elements.push(
        <strong key={offset}>
          <em>{boldItalicContent}</em>
        </strong>
      );
    }
    // Negrita
    else if (boldContent) {
      elements.push(<strong key={offset}>{boldContent}</strong>);
    }
    // Cursiva
    else if (italicContent) {
      elements.push(<em key={offset}>{italicContent}</em>);
    }
    lastIndex = offset + match.length;
  }
  );

  // Agregar el resto del texto después de la última coincidencia
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  return elements;
};

// Función para renderizar texto con saltos de línea, viñetas y estilos
export const renderDescription = (description) => {
  return description.split("\n").map((line, index) => {
    if (line.startsWith("*")) {
      // Aplica una clase específica para viñetas alineadas a la derecha
      return (
        <li key={index} className={styles.rightAlignedList}>
          {renderTextWithStyles(line.substring(2))}
        </li>
      );
    } else if (line.trim() === "") {
      return <br key={index} />;
    } else {
      return (
        <p key={index} style={{ margin: "0.5rem 0" }}>
          {renderTextWithStyles(line)}
        </p>
      );
    }
  });
};