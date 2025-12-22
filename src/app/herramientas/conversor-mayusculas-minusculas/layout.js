import Navbar from '@/shared/Navbar';
import Footer from '@/shared/Footer';

export const metadata = {
  title: "Convertidor de texto",
  description: "Convierte texto a distintos formatos de mayúsculas y minúsculas.",
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
