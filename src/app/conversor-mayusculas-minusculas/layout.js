import Navbar from "@/components/landing/Header";

export const metadata = {
  title: "Conversor de mayúsculas y minúsculas",
  description:
    "Herramienta para convertir texto a mayúsculas, minúsculas, capitalización por oración, title case y formatos como camelCase, kebab-case y snake_case.",
  openGraph: {
    title: "Conversor de mayúsculas y minúsculas",
    description:
      "Convierte texto a oración, capitalización, mayúsculas/minúsculas y formatos camelCase/kebab/snake.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Conversor de mayúsculas y minúsculas",
    description:
      "Convierte texto a oración, title case, mayúsculas/minúsculas y formatos camelCase/kebab/snake.",
  },
};

export default function Layout({ children }) {
  return (
    <main style={{ padding: "5rem 1rem" }}>
      <Navbar />
      {children}
    </main>
  );
}
