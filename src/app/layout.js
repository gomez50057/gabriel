import "./globals.css";
import GoogleAnalytics from "@/shared/GoogleAnalytics/GoogleAnalytics";

const title = "Gabriel Gómez | Desarrollador web";
const description =
  "Desarrollo plataformas y sitios web funcionales, accesibles y orientados a resultados, desde el diseño hasta el despliegue.";
const socialImage = {
  url: "./img/social/gabriel-gomez-open-graph.png",
  width: 1200,
  height: 630,
  alt: "Gabriel Gómez — Desarrollo web y plataformas digitales",
};

export const metadata = {
  metadataBase: new URL("https://gomez50057.github.io/GG/"),
  title: {
    default: title,
    template: "%s | Gabriel Gómez",
  },
  description,
  applicationName: "Portafolio de Gabriel Gómez",
  keywords: [
    "desarrollo web",
    "desarrollador web en Hidalgo",
    "plataformas web",
    "JavaScript",
    "React",
    "Next.js",
    "Pachuca",
    "Hidalgo",
  ],
  authors: [{ name: "Gabriel Gómez Gómez" }],
  creator: "Gabriel Gómez Gómez",
  publisher: "Gabriel Gómez Gómez",
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_MX",
    siteName: "Portafolio de Gabriel Gómez",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/img/logo.svg",
    apple: "/img/logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E7BD70" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
