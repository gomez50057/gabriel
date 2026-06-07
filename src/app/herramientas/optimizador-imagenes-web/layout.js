import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "Optimizador de imagenes web",
  description:
    "Convierte imagenes a WebP, reduce peso y conserva calidad visual desde el navegador.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EF959D" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "light dark",
};

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: "5rem 1rem" }}>{children}</main>
      <Footer />
    </>
  );
}
