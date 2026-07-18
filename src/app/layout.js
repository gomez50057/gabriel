import "./globals.css";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import GoogleAnalytics from "@/shared/GoogleAnalytics/GoogleAnalytics";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/config/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const title = "Gabriel Gómez | Desarrollador web";
const description =
  "Desarrollo plataformas y sitios web funcionales, accesibles y orientados a resultados, desde el diseño hasta el despliegue.";
const socialImage = {
  url: "/img/social/gabriel-gomez-open-graph.png",
  width: 1200,
  height: 630,
  alt: "Gabriel Gómez — Desarrollo web y plataformas digitales",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Gabriel Gómez",
  },
  description,
  applicationName: SITE_NAME,
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
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_MX",
    siteName: SITE_NAME,
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
      <body className={`${montserrat.variable} ${bodoniModa.variable}`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
