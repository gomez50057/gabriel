import "./globals.css";
import GoogleAnalytics from "@/shared/GoogleAnalytics/GoogleAnalytics";

export const metadata = {
  title: "Gabriel Gomez Desarrollador Web",
  description:
    "Hola soy Gabriel Gomez👋🏻 Programador cualificado en depuración, diseño, desarrollo y prueba de software. Competente en planeación, logística, compras y control de calidad.",
  keywords: [
    "Pachuca",
    "Desarrollo Web",
    "Programador web",
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Diseño Web",
    "Analítica",
    "Branding",
    "Hidalgo",
  ],
  authors: [{ name: "Gabriel Gomez│gomez50057" }],
  metadataBase: new URL("https://gomez50057.github.io/GG/"),
  icons: {
    icon: "/img/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EF959D" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body>{children}</body>
    </html>
  );
}
