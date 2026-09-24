import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "¿Conoces Hidalgo? | Minijuegos de municipios",
  description:
    "Pon a prueba tus conocimientos sobre los 84 municipios y la organización territorial del Estado de Hidalgo.",
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
