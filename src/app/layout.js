import "./globals.css";

export const metadata = {
  title: 'Gabriel Gomez Desarrollador Web',
  description:
    'Hola soy Gabriel Gomez👋🏻 Programador cualificado en depuración, diseño, desarrollo y prueba de software. Competente en planeación, logística, compras y control de calidad.',
  keywords: [
    'Pachuca', 'Desarrollo Web', 'Programador web', 'HTML', 'CSS', 'JavaScript',
    'React', 'Diseño Web', 'Analítica', 'Branding', 'Hidalgo'
  ],
  themeColor: '#EF959D',
  authors: [{ name: 'Gabriel Gomez│gomez50057' }],
  metadataBase: new URL('https://gomez50057.github.io/GG/'),
  icons: {
    icon: '/img/logo.svg',
    apple: '/logo.svg',
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="light">
      <head>
        
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
