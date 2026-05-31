import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export const metadata = {
  title: "QrStudio",
  description:
    "Generador de codigos QR estaticos con carga manual, CSV, JSON y Excel.",
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
