export const TOOLS_LINKS = [
  {
    href: "/herramientas/conversor-mayusculas-minusculas",
    label: "Convertidor de texto",
  },
  {
    href: "/herramientas/localizador-municipios-hidalgo",
    label: "Localizador de municipios de Hidalgo",
  },
  {
    href: "/herramientas/generador-clamp",
    label: "Generador de clamp",
  },
  {
    href: "/herramientas/corner-shape-generador",
    label: "Generador de corner-shape",
  },
  {
    href: "/herramientas/generador-marcas-agua",
    label: "Generador de marcas de agua",
  },
];

export const HEADER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#sobremi", label: "Sobre Mí" },
  { href: "/hacks", label: "Hacks" },
  { href: "/#portfolio", label: "Portafolio" },
  {
    label: "Herramientas",
    children: TOOLS_LINKS,
  },
  { href: "/#contacto", label: "Contacto" },
];

export const NAVBAR_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/hacks", label: "Hacks" },
  {
    label: "Herramientas",
    children: TOOLS_LINKS,
  },
];