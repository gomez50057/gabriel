import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "¿Conoces Hidalgo? | Minijuegos de municipios",
  description:
    "Explora los 84 municipios de Hidalgo mediante minijuegos interactivos sobre geografía, regiones, historia y cultura. Pon a prueba tus conocimientos y descubre la organización territorial del estado.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "light dark",
};

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "var(--header-h, 72px)" }}>{children}</main>
      <Footer />
    </>
  );
}
