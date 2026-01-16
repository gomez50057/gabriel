export const PROJECTS_BASE = "/img/proyectos/";
export const PROJECTS_CASE = "/img/caseStudy/";

export const defaultItems = [
  {
    id: "1",
    title: "Fresadora",
    kind: "image",
    group: "CNC",
    src: `${PROJECTS_BASE}cncx4.webp`,
  },
  {
    id: "2",
    title: "DÁZABI playera",
    kind: "image",
    group: "Diseño Gráfico",
    src: `${PROJECTS_BASE}p-playera.png`,
  },
  {
    id: "3",
    title: "DÁZABI cartel",
    kind: "image",
    group: "Diseño Gráfico",
    src: `${PROJECTS_BASE}cartel.png`,
  },
  {
    id: "4",
    title: "Torno",
    kind: "image",
    group: "CNC",
    src: `${PROJECTS_BASE}CNC-1605.png`,
  },
  {
    id: "5",
    title: "DÁZABI taza",
    kind: "image",
    group: "Diseño Gráfico",
    src: `${PROJECTS_BASE}taza.jpg`,
  },
  {
    id: "6",
    title: "Video de Copo de Nieve",
    group: "Diseño (Video)",
    kind: "link",
    src: `${PROJECTS_BASE}p-nieve-video.png`,
    href: "https://youtu.be/fnFx3II83Rk",
  },
  {
    id: "7",
    title: "DÁZABI video",
    group: "Diseño (Video)",
    kind: "link",
    src: `${PROJECTS_BASE}p-video.png`,
    href: "https://youtu.be/T_od3nS6WAU",
  },
  {
    id: "8",
    title: "Torno",
    kind: "image",
    group: "CNC",
    src: `${PROJECTS_BASE}CNC-2405.png`,
  },
  {
    id: "9",
    title: "Invitación de boda (página web)",
    group: "Diseño Web",
    kind: "link",
    src: `${PROJECTS_BASE}p-video.png`,
    href: "https://gomez50057.github.io/Boda-de-Grisel-y-Edison/",
  },
  {
    id: "10",
    title: "DÁZABI logo",
    kind: "image",
    group: "Diseño Gráfico",
    src: `${PROJECTS_BASE}p-logo.jpg`,
  },
  {
    id: "11",
    title: "Fresadora",
    kind: "image",
    group: "CNC",
    src: `${PROJECTS_BASE}CNC-2306.png`,
  },
  {
    id: "12",
    title: "Torno",
    kind: "image",
    group: "CNC",
    src: `${PROJECTS_BASE}CNC-1106.png`,
  },
  {
    id: "13",
    title: "Fuego (logo restaurante)",
    kind: "image",
    group: "Branding",
    src: `${PROJECTS_BASE}Logo-fuego.webp`,
  },
  {
    id: "14",
    title: "Abogados Mérida y Asociados (logo)",
    kind: "image",
    group: "Branding",
    src: `${PROJECTS_BASE}merida.webp`,
  },
];

export const defaultLayouts = {
  lg: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 4, y: 0, w: 5, h: 4 },
    { i: "3", x: 9, y: 0, w: 3, h: 6 },
  ],
  md: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 4, y: 0, w: 4, h: 4 },
    { i: "3", x: 0, y: 5, w: 4, h: 5 },
  ],
  sm: [
    { i: "1", x: 0, y: 0, w: 3, h: 5 },
    { i: "2", x: 3, y: 0, w: 3, h: 4 },
    { i: "3", x: 0, y: 5, w: 6, h: 5 },
  ],
  xs: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 0, y: 5, w: 4, h: 4 },
    { i: "3", x: 0, y: 9, w: 4, h: 6 },
  ],
};

export const portfolioRecentProjects = [
  {
    id: "p1",
    title: "El Fuego restaurant",
    stack: "Página web",
    image: "/img/proyectos/fuego.webp",
    links: [{ href: "https://gomez50057.github.io/el-fuego/", label: "Ver demo", icon: "eye" }],
  },
  {
    id: "p2",
    title: "Carrito de compras inteligente",
    stack: "Carrito inteligente",
    image: "/img/proyectos/proyecto8.webp",
    links: [
      {
        href: "https://sketchfab.com/models/2453f8b6f65540bc8115f6906331edc9/embed",
        label: "Ver demo",
        icon: "external",
      },
    ],
  },
  {
    id: "p3",
    title: "Casa",
    stack: "Carrito inteligente",
    image: "/img/proyectos/proyecto9.webp",
    links: [
      {
        href: "https://sketchfab.com/models/b74bb885a1c94f68822ae241e6b2207e/embed?ui_theme=dark",
        label: "Ver demo",
        icon: "external",
      },
    ],
  },
  {
    id: "p4",
    title: "Plan Hídrico del Valle del Mezquital",
    stack: "Difusión, participación y gestión de aportaciones",
    image: `${PROJECTS_CASE}plan-hidrico-mezquital.webp`,
    links: [
      {
        href: "/caso-estudio/plan-hidrico-del-valle-del-mezquital-difusion-participacion-y-gestion-de-aportaciones",
        label: "Ver demo",
        icon: "external",
      },
    ],
  },
  {
    id: "p5",
    title: "Metrópoli",
    stack: "Plataforma integral para planeación y coordinación metropolitana",
    image: `${PROJECTS_CASE}metropoli-plataforma.webp`,
    links: [
      {
        href: "/caso-estudio/metropoli-plataforma-integral-para-planeacion-y-coordinacion-metropolitana",
        label: "Ver demo",
        icon: "external",
      },
    ],
  },
  {
    id: "p6",
    title: "Biblioteca Digital de Planeación",
    stack: "Consulta pública de instrumentos y documentos",
    image: `${PROJECTS_CASE}biblioteca-digital-planeacion.webp`,
    links: [
      {
        href: "/caso-estudio/biblioteca-digital-de-planeacion-consulta-publica-de-instrumentos-y-documentos",
        label: "Ver demo",
        icon: "external",
      },
    ],
  },
];
