{
  name: "Título del artículo",

  description: [

    {
      type: "p",
      text: "Párrafo con **negritas**, *cursivas* y `código`."
    },

    {
      type: "p",
      parts: [
        { type: "text", text: "Texto con un " },
        {
          type: "link",
          href: "https://developer.mozilla.org",
          text: "enlace"
        }
      ]
    },

    {
      type: "h2",
      text: "Encabezado H2"
    },

    {
      type: "h3",
      text: "Encabezado H3"
    },

    {
      type: "ul",
      items: [
        "Elemento 1",
        "Elemento 2",
        "**Elemento destacado**"
      ]
    },

    {
      type: "list",
      items: [
        "También puedes usar list en lugar de ul"
      ]
    },

    {
      type: "snippet",
      language: "js",
      fileName: "ejemplo.js",
      code: "const mensaje = 'Hola';\nconsole.log(mensaje);",
      showLineNumbers: true,
      wrap: false
    },

    {
      type: "code",
      language: "bash",
      fileName: "terminal",
      text: "npm install\nnpm run dev"
    },

    {
      type: "table",
      headers: [
        "Situación",
        "Resultado",
        "Observación"
      ],
      rows: [
        [
          "Primera situación",
          "Sí",
          "Correcto"
        ],
        [
          "Segunda situación",
          "No",
          "Revisar configuración"
        ]
      ]
    },

    {
      type: "callout",
      variant: "info",
      title: "Punto clave",
      text: "Este es un aviso importante para el lector."
    },

    {
      type: "image",
      src: "/img/tutoriales/imagen-dentro.png",
      alt: "Descripción de la imagen",
      caption: "Texto debajo de la imagen",
      width: 1200,
      height: 675,
      variant: "small"
    },

    {
      type: "link",
      href: "https://github.com",
      text: "Visitar GitHub"
    },

    {
      type: "downloadLink",
      href: "/material/proyecto.zip",
      text: "Descargar proyecto",
      fileName: "proyecto.zip"
    }
  ],

  date: "24 de agosto, 2026",

  image: "/img/tutoriales/imagen-principal.png",

  category: "Tutoriales",

  featuredPosts: true,

  author: "Gabriel Gómez Gómez",

  publishedAt: "2026-08-24",

  updatedAt: "2026-08-25",

  quote: "Esta frase se muestra como cita al final del artículo.",

  media: [
    {
      type: "image",
      src: "/img/tutoriales/segunda-imagen.png",
      alt: "Segunda imagen",
      caption: "Imagen adicional"
    },
    {
      type: "video",
      src: "/videos/demo.mp4",
      poster: "/img/tutoriales/video-poster.png",
      caption: "Video demostrativo"
    }
  ]
}