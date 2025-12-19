import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
