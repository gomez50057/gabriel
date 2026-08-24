import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "Unir, ordenar y separar PDF",
  description:
    "Une archivos PDF, ordena páginas, extrae rangos, gira hojas y separa documentos directamente en tu navegador.",
  alternates: { canonical: "/herramientas/unir-organizar-pdf" },
  openGraph: {
    title: "Unir, ordenar y separar PDF",
    description:
      "Organiza y combina archivos PDF de forma privada directamente en tu navegador.",
    url: "/herramientas/unir-organizar-pdf",
  },
};

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: "6rem 1rem 2rem" }}>{children}</main>
      <Footer />
    </>
  );
}
