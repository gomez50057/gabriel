import Navbar from "@/shared/Navbar";
import Footer from '@/shared/Footer';

export const metadata = {
  title: "Generador de css corner-shape",
  description:
    "Genera valores de corner-shape a partir de formas predefinidas y valores de border-radius en porcentaje para cada esquina.",
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
      <main style={{ padding: "5rem 1rem" }}>
        <Navbar />
        {children}
      </main>
      <Footer />
    </>
  );
}
