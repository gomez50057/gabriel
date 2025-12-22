import Navbar from "@/shared/Navbar";
import Footer from '@/shared/Footer';

export const metadata = {
  title: "Generador de clamp",
  description:
    "Genera valores de font-size con clamp() a partir de anchos mínimos y máximos del viewport y tamaños mínimos y máximos de fuente.",
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
