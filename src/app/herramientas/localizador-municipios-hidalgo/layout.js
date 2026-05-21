import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "Localizador de municipios de Hidalgo",
  description:
    "Consulta a qué región, macrorregión y microrregión pertenece cada municipio del Estado de Hidalgo.",
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
      <main style={{ padding: "5rem 1rem" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}