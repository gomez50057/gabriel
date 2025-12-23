export const blogPosts = [
  {
    name: "Font-size clamp() explicado: fórmula base, pendiente e intercepto",
    description: [
      { type: "p", text: "Este artículo explica la fórmula matemática detrás del **FontClampGenerator** y el significado real de los valores que aparecen como **Pendiente** e **Intercepto**. La meta es generar una regla CSS de tipografía fluida usando `clamp(min, preferido, max)` de forma correcta y predecible." },
      { type: "p", text: "La idea central es simple: queremos que el tamaño de fuente crezca de forma lineal desde un valor mínimo hasta uno máximo, dentro de un rango de anchuras de viewport." },
      { type: "p", text: "Definimos dos puntos en una gráfica donde:\n• **Punto 1:** ancho mínimo del viewport = `minVW` y tamaño mínimo de fuente = `minFS`.\n• **Punto 2:** ancho máximo del viewport = `maxVW` y tamaño máximo de fuente = `maxFS`." },
      { type: "p", text: "Con esos dos puntos construimos una recta. En CSS, esa recta la expresamos como una forma compatible con unidades responsivas:\n`font-size: clamp(minFS, calc(intercepto + pendiente * vw), maxFS)`." },
      { type: "p", text: "El **valor preferido** es la parte fluida. Es decir, el bloque que cambia en función del ancho de la pantalla:\n`calc(InterceptoPx + PendienteVw)`." },
      { type: "p", text: "La fórmula que usa el generador es la estándar para convertir una recta definida en píxeles a un término en `vw`:" },
      {
        type: "snippet", language: "js", fileName: "formula.js", code: `// Datos de entrada en px
          // minVW, maxVW, minFS, maxFS

          // 1) Pendiente (coeficiente de vw)
          const slope = ((maxFS - minFS) / (maxVW - minVW)) * 100;

          // 2) Intercepto (término constante en px)
          const intercept = minFS - (slope * minVW) / 100;

          // 3) Expresión CSS final
          const preferred = \`calc(\${intercept}px + \${slope}vw)\`;
          const clamp = \`clamp(\${minFS}px, \${preferred}, \${maxFS}px)\`;` },
      { type: "p", text: "**¿Por qué multiplicamos por 100?**\nPorque `1vw` representa el **1%** del ancho del viewport. Para que la recta pase exactamente por los dos puntos (minVW/minFS y maxVW/maxFS), convertimos la pendiente de “px por px” a “px por vw”." },
      { type: "p", text: "En otras palabras, esta relación asegura que:\n• Cuando el viewport mide **minVW**, el cálculo devuelve **minFS**.\n• Cuando el viewport mide **maxVW**, el cálculo devuelve **maxFS**." },
      { type: "h2", text: "¿Qué significa **Pendiente**?" },
      { type: "p", text: "En el generador, la **Pendiente** es el número que acompaña al `vw` dentro del `calc()`.\nEjemplo conceptual:\n`calc(10px + 1.25vw)` → aquí **1.25** es la pendiente." },

      { type: "p", text: "Interpretación práctica:\n• Una pendiente más alta significa que el texto crece más rápido conforme aumenta el ancho del viewport.\n• Una pendiente más baja produce un crecimiento más suave." },
      { type: "p", text: "Por eso en el panel de resultados verás algo como:\n**Pendiente: xx.xx**\nEse valor es el coeficiente real que alimenta la parte `+ xx.xxvw`." },
      { type: "h3", text: "¿Qué significa **Intercepto**?" },
      { type: "p", text: "El **Intercepto** es el valor fijo en píxeles que se suma a la parte responsiva.\nEjemplo conceptual:\n`calc(10px + 1.25vw)` → aquí **10px** es el intercepto." },

      { type: "p", text: "Interpretación práctica:\n• Ajusta el punto de partida de la recta.\n• Permite que la fórmula siga siendo exacta en el ancho mínimo definido." },
      { type: "p", text: "En el panel del generador normalmente lo verás así:\n**Intercepto: xxx.xxx px**\nEste valor alimenta el bloque `calc(InterceptoPx + PendienteVw)`." },
      { type: "h3", text: "Resumen de la regla final" },
      { type: "p", text: "El generador produce esta estructura:\n`font-size: clamp(minFSpx, calc(interceptoPx + pendienteVw), maxFSpx);`" },
      { type: "p", text: "Con esto consigues una tipografía que:\n• Nunca baja de **minFS**.\n• Escala de forma fluida entre anchos mínimos y máximos.\n• Nunca supera **maxFS**." },
    ],
    date: "9 de diciembre, 2025",
    image: "/img/tutoriales/css-clamp-tipografia.jpg",
    category: "Frontend",
    featuredPosts: false
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