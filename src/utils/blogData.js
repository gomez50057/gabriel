// Negrita: **Este texto estará en negrita**
// Cursiva: *Este texto estará en cursiva*
// Viñetas: * Elemento de lista
// Saltos de línea: \n
// Negrita y Cursiva: **_Este texto estará en negrita y Cursiva_**

import styles from "../components/blog/FullPost.module.css";
import Snippet from "@/components/blog/Snippet";

export const blogPosts = [
  {
    name: "Guía paso a paso: crea tu proyecto con Next.js 15",
    description: [
      { "type": "p", "text": "Vamos a crear un proyecto de Next.js 15 desde cero, eligiendo opciones óptimas para tu stack: JavaScript (sin TypeScript), App Router, carpeta src/, CSS Modules, y ESLint activado. Te explico cada decisión pensando en rendimiento, seguridad y mantenibilidad." },

      { "type": "p", "text": "1) Requisitos: Node 20 LTS recomendado (18.18+ funciona), npm (o pnpm), y Git." },
      { "type": "snippet", "language": "bash", "code": "node -v\nnpm -v\ngit --version", "fileName": "terminal" },

      { "type": "p", "text": "2) Crea el proyecto con create-next-app. Si prefieres responder al asistente interactivo, usa:" },
      { "type": "snippet", "language": "bash", "code": "npx create-next-app@latest mi-app", "fileName": "terminal" },

      { "type": "p", "text": "Qué elegir en los prompts (recomendado para tu flujo):\n• TypeScript: No (trabajaremos con JavaScript puro, más rápido de montar y suficiente si el equipo no exige TS).\n• ESLint: Sí (consistencia y calidad del código).\n• Tailwind: No (usarás CSS Modules .module.css como prefieres).\n• src/ directory: Sí (estructura limpia y escalable).\n• App Router: Sí (Server Components por defecto, mejor rendimiento y organización).\n• Import alias: Acepta el predeterminado (@/*) para rutas limpias." },

      { "type": "p", "text": "Si quieres saltarte los prompts, puedes indicar flags comunes (sin forzar Tailwind):" },
      { "type": "snippet", "language": "bash", "code": "npx create-next-app@latest mi-app \\\n  --js \\\n  --eslint \\\n  --src-dir \\\n  --app \\\n  --import-alias \"@/*\" \\\n  --use-npm", "fileName": "terminal" },

      { "type": "p", "text": "3) Entra y ejecuta el servidor de desarrollo:" },
      { "type": "snippet", "language": "bash", "code": "cd mi-app\nnpm run dev", "fileName": "terminal" },

      { "type": "p", "text": "4) Estructura base (carpeta src/ + App Router). Deberías ver algo similar:" },
      { "type": "snippet", "language": "text", "code": "mi-app/\n├─ public/\n├─ src/\n│  └─ app/\n│     ├─ favicon.ico\n│     ├─ globals.css\n│     ├─ layout.js\n│     └─ page.js\n├─ .eslintrc.json\n├─ jsconfig.json\n├─ next.config.mjs\n├─ package.json\n└─ README.md", "fileName": "estructura" },

      { "type": "p", "text": "5) Layout global y metadatos. Usa metadata nativa para SEO y compartir en redes." },
      { "type": "snippet", "language": "javascript", "code": "// src/app/layout.js\nexport const metadata = {\n  title: \"Mi App | Next.js 15\",\n  description: \"Base con App Router, Server Components y CSS Modules.\",\n  icons: { icon: \"/favicon.ico\" },\n};\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"es\">\n      <body>{children}</body>\n    </html>\n  );\n}", "fileName": "layout.js" },

      { "type": "p", "text": "6) Primera página como Server Component (por defecto). Importa un CSS Module para estilos locales y evitar fugas de estilo." },
      { "type": "snippet", "language": "javascript", "code": "// src/app/page.js\nimport styles from \"./page.module.css\";\n\nexport default function Home() {\n  return (\n    <main className={styles.main}>\n      <h1>¡Hola Next.js 15!</h1>\n      <p>App Router + CSS Modules + Server Components</p>\n    </main>\n  );\n}", "fileName": "page.js" },
      { "type": "snippet", "language": "css", "code": "/* src/app/page.module.css */\n.main {\n  min-height: 100dvh;\n  display: grid;\n  place-items: center;\n  text-align: center;\n  padding: 2rem;\n}", "fileName": "page.module.css" },

      { "type": "p", "text": "7) Globals mínimos. Deja solo resets y variables. Evita estilos globales invasivos para no romper módulos." },
      { "type": "snippet", "language": "css", "code": "/* src/app/globals.css */\n:root {\n  --vino: #691b32;\n  --fg: #111315;\n  --bg: #ffffff;\n}\n* { box-sizing: border-box; }\nhtml, body { margin: 0; padding: 0; color: var(--fg); background: var(--bg); font-family: system-ui, sans-serif; }\na { color: inherit; text-decoration: none; }", "fileName": "globals.css" },

      { "type": "p", "text": "8) Imágenes y estáticos. Guarda tus assets en /public y usa `next/image` para optimización automática." },
      { "type": "snippet", "language": "javascript", "code": "// ejemplo de uso local de imagen\nimport Image from \"next/image\";\n\nexport default function Logo() {\n  return (\n    <Image src=\"/img/logo.png\" alt=\"Logo\" width={160} height={48} priority />\n  );\n}", "fileName": "Logo.js" },

      { "type": "p", "text": "9) Variables de entorno. Nunca expongas secretos en el cliente. Usa `.env.local` (no se versiona)." },
      { "type": "snippet", "language": "bash", "code": "echo \"NEXT_PUBLIC_API_BASE=https://api.midominio.com\" >> .env.local\n# Las que NO deben llegar al navegador NO llevan NEXT_PUBLIC_\n# API_SECRET=xxxxx", "fileName": ".env.local" },

      { "type": "p", "text": "10) ESLint: activado para mantener calidad. Puedes afinar reglas si lo necesitas." },
      { "type": "snippet", "language": "json", "code": "{\n  \"extends\": [\"next/core-web-vitals\"],\n  \"rules\": {\n    \"react/no-unescaped-entities\": \"off\"\n  }\n}", "fileName": ".eslintrc.json" },

      { "type": "p", "text": "11) Config opcional de Next (por ejemplo, permitir imágenes remotas). Solo si las usas." },
      { "type": "snippet", "language": "javascript", "code": "// next.config.mjs\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  images: {\n    remotePatterns: [\n      { protocol: \"https\", hostname: \"images.unsplash.com\" }\n    ]\n  }\n};\nexport default nextConfig;", "fileName": "next.config.mjs" },

      { "type": "p", "text": "12) Rutas y segmentación. Con App Router, cada carpeta en src/app es una ruta. Crea `/src/app/(public)/about/page.js` para agrupar rutas públicas, y usa Server Components siempre que no necesites estado/efectos del cliente." },
      { "type": "snippet", "language": "javascript", "code": "// src/app/(public)/about/page.js\nexport default function AboutPage() {\n  return <h2>Acerca de</h2>;\n}", "fileName": "about/page.js" },

      { "type": "p", "text": "13) Componentes de Cliente solo cuando sea necesario (interactividad, efectos, refs). Al inicio del archivo añade \"use client\"." },
      { "type": "snippet", "language": "javascript", "code": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n+1)}>Clicks: {n}</button>;\n}", "fileName": "Counter.js" },

      { "type": "p", "text": "14) Scripts útiles (build y producción). En dev puedes probar Turbopack opcionalmente." },
      { "type": "snippet", "language": "bash", "code": "npm run build\nnpm run start\n# Opcional en desarrollo:\n# next dev --turbo", "fileName": "terminal" },

      { "type": "p", "text": "15) Buenas prácticas de arquitectura (resumen):\n• Server Components por defecto: menos JS en el cliente, cargas más rápidas.\n• Encapsula estilos con .module.css para evitar colisiones.\n• Fetch en el servidor con caché adecuada (revalidate, cache: 'no-store' donde aplique).\n• Nunca expongas secretos en NEXT_PUBLIC_.\n• Segmenta rutas por dominio (p. ej., (public), (dashboard)).\n• Desacopla UI y datos: componentes puros + funciones de acceso a datos." },

      { "type": "p", "text": "Con esto tendrás una base sólida, rápida y mantenible acorde a tu stack (Next.js 15 + React 19, App Router, CSS Modules). ¿Seguimos con la integración de un backend en Django y un fetch de ejemplo desde un Route Handler?" }
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/nextjs-setup.png",
    category: "Desarrollo Web",
    featuredPosts: true
  },
  {
    name: "Guía paso a paso: crea tu proyecto con Django 5.2 (LTS)",
    description: [
      { "type": "p", "text": "Vamos a crear un proyecto Django 5.2 LTS con buenas prácticas: entorno virtual aislado, ejecución del servidor, creación de una app base y manejo correcto de migraciones. Incluyo extras para PostgreSQL si luego conectas con tu stack Next.js + Django." },

      { "type": "p", "text": "1) Requisitos: Python 3.11+ (recomendado 3.12), pip y Git." },
      { "type": "snippet", "language": "bash", "code": "python --version\npip --version\ngit --version", "fileName": "terminal" },

      { "type": "p", "text": "2) Crea y activa un entorno virtual (aísla dependencias). En Windows usa `Scripts\\activate`." },
      { "type": "snippet", "language": "bash", "code": "mkdir mi_backend && cd mi_backend\npython -m venv .venv\n# macOS/Linux\nsource .venv/bin/activate\n# Windows (PowerShell)\n# .venv\\Scripts\\Activate.ps1", "fileName": "terminal" },

      { "type": "p", "text": "3) Actualiza pip e instala Django 5.2.2 (LTS). Congela dependencias en requirements." },
      { "type": "snippet", "language": "bash", "code": "python -m pip install --upgrade pip\npip install \"Django==5.2.2\"\npip freeze > requirements.txt", "fileName": "terminal" },

      { "type": "p", "text": "4) Crea el proyecto base y valida que corre." },
      { "type": "snippet", "language": "bash", "code": "django-admin startproject config .\npython manage.py migrate\npython manage.py runserver 8000", "fileName": "terminal", "wrap": true },

      { "type": "p", "text": "5) Ajustes mínimos en settings: zona horaria MX y español. (Archivo: `config/settings.py`)." },
      { "type": "snippet", "language": "python", "code": "# config/settings.py\nLANGUAGE_CODE = \"es-mx\"\nTIME_ZONE = \"America/Mexico_City\"\nUSE_I18N = True\nUSE_TZ = True\nALLOWED_HOSTS = [\"localhost\", \"127.0.0.1\"]", "fileName": "config/settings.py" },

      { "type": "p", "text": "6) Crea una app (módulo funcional). Agrega la app a `INSTALLED_APPS`." },
      { "type": "snippet", "language": "bash", "code": "python manage.py startapp core", "fileName": "terminal" },
      { "type": "snippet", "language": "python", "code": "# config/settings.py\nINSTALLED_APPS = [\n  # Django apps\n  \"django.contrib.admin\",\n  \"django.contrib.auth\",\n  \"django.contrib.contenttypes\",\n  \"django.contrib.sessions\",\n  \"django.contrib.messages\",\n  \"django.contrib.staticfiles\",\n  # Tu app\n  \"core\",\n]", "fileName": "config/settings.py" },

      { "type": "p", "text": "7) Primer modelo y migraciones. Cada vez que modifiques modelos: `makemigrations` y luego `migrate`." },
      { "type": "snippet", "language": "python", "code": "# core/models.py\nfrom django.db import models\n\nclass Nota(models.Model):\n    titulo = models.CharField(max_length=200)\n    creada = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return self.titulo", "fileName": "core/models.py" },
      { "type": "snippet", "language": "bash", "code": "python manage.py makemigrations\npython manage.py migrate", "fileName": "terminal" },

      { "type": "p", "text": "8) Admin rápido para validar. Crea superusuario y registra el modelo." },
      { "type": "snippet", "language": "python", "code": "# core/admin.py\nfrom django.contrib import admin\nfrom .models import Nota\nadmin.site.register(Nota)", "fileName": "core/admin.py" },
      { "type": "snippet", "language": "bash", "code": "python manage.py createsuperuser\npython manage.py runserver 8000\n# Entra a http://127.0.0.1:8000/admin/", "fileName": "terminal" },

      { "type": "p", "text": "9) Cómo ejecutar el proyecto (resumen). Activa el entorno y corre el servidor." },
      { "type": "snippet", "language": "bash", "code": "# Cada vez que regreses al proyecto\ncd mi_backend\nsource .venv/bin/activate   # (o .venv\\Scripts\\Activate.ps1 en Windows)\npython manage.py runserver 8000", "fileName": "terminal" },

      { "type": "p", "text": "10) Cómo actualizar las migraciones (cambios en modelos). Orden recomendado:" },
      { "type": "snippet", "language": "bash", "code": "# 1) Edita tus modelos (models.py)\n# 2) Genera migraciones\npython manage.py makemigrations\n# 3) Aplica migraciones a la base\npython manage.py migrate\n# Utilidad: ver el estado\npython manage.py showmigrations\n# Rehacer última migración (si te equivocaste durante desarrollo)\n# python manage.py migrate core 0001", "fileName": "terminal", "wrap": true },

      { "type": "p", "text": "11) PostgreSQL (opcional pero recomendado en producción). Instala el driver `psycopg[binary]` y configura `DATABASES`." },
      { "type": "snippet", "language": "bash", "code": "pip install \"psycopg[binary]~=3.2\"\npip freeze > requirements.txt", "fileName": "terminal" },
      { "type": "snippet", "language": "python", "code": "# config/settings.py\nimport os\n\nDATABASES = {\n  \"default\": {\n    \"ENGINE\": \"django.db.backends.postgresql\",\n    \"NAME\": os.getenv(\"PGDATABASE\", \"mi_db\"),\n    \"USER\": os.getenv(\"PGUSER\", \"mi_usuario\"),\n    \"PASSWORD\": os.getenv(\"PGPASSWORD\", \"mi_password\"),\n    \"HOST\": os.getenv(\"PGHOST\", \"localhost\"),\n    \"PORT\": os.getenv(\"PGPORT\", \"5432\"),\n  }\n}", "fileName": "config/settings.py" },
      { "type": "snippet", "language": "bash", "code": "echo \"PGDATABASE=mi_db\" >> .env\necho \"PGUSER=mi_usuario\" >> .env\necho \"PGPASSWORD=mi_password\" >> .env\necho \"PGHOST=localhost\" >> .env\necho \"PGPORT=5432\" >> .env", "fileName": "terminal" },

      { "type": "p", "text": "12) Archivos estáticos (mínimo). En desarrollo, Django los sirve; en producción usa servidor de archivos o CDN." },
      { "type": "snippet", "language": "python", "code": "# config/settings.py\nSTATIC_URL = \"/static/\"\nSTATICFILES_DIRS = []  # si usas /static/ en la raíz del proyecto\n", "fileName": "config/settings.py" },

      { "type": "p", "text": "13) Seguridad y orden: usa `.gitignore`, separa settings por entorno y nunca subas secretos." },
      { "type": "snippet", "language": "bash", "code": "curl -s https://www.toptal.com/developers/gitignore/api/python,django > .gitignore", "fileName": "terminal" },

      { "type": "p", "text": "14) Comandos útiles de mantenimiento." },
      { "type": "snippet", "language": "bash", "code": "# Shell interactiva con contexto Django\npython manage.py shell\n# Comprobar errores comunes\npython manage.py check\n# Probar consultas (perf) con DEBUG off (entorno prod)\npython manage.py runserver --insecure", "fileName": "terminal" },

      { "type": "p", "text": "Con esto tienes un backend Django listo: virtualenv, ejecución local y flujo de migraciones claro." }
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/django-setup.png",
    category: "Backend",
    featuredPosts: true
  },
  {
    name: "Django + PostgreSQL: conexión segura con .env (dotenv)",
    description: [
      { "type": "p", "text": "Conectaremos tu proyecto Django 5.2.x a PostgreSQL usando variables de entorno con `python-dotenv`. Así evitamos exponer secretos y mantenemos entornos (dev/prod) aislados." },

      { "type": "p", "text": "1) Instala dependencias (driver y dotenv). Usa el binario de psycopg para simplificar." },
      { "type": "snippet", "language": "bash", "code": "source .venv/bin/activate   # (Windows: .venv\\Scripts\\Activate.ps1)\npip install \"psycopg[binary]~=3.2\" python-dotenv\npip freeze > requirements.txt", "fileName": "terminal" },

      { "type": "p", "text": "2) Crea tu base de datos y usuario en PostgreSQL (si aún no existen)." },
      { "type": "snippet", "language": "sql", "code": "-- Dentro de psql (o usa PGAdmin)\nCREATE ROLE mi_usuario WITH LOGIN PASSWORD 'mi_password';\nALTER ROLE mi_usuario SET client_encoding TO 'UTF8';\nALTER ROLE mi_usuario SET default_transaction_isolation TO 'read committed';\nALTER ROLE mi_usuario SET timezone TO 'America/Mexico_City';\nCREATE DATABASE mi_db OWNER mi_usuario;\nGRANT ALL PRIVILEGES ON DATABASE mi_db TO mi_usuario;", "fileName": "psql" },

      { "type": "p", "text": "3) Crea un archivo .env en la raíz del proyecto (junto a manage.py) con las variables para la conexión." },
      { "type": "snippet", "language": "bash", "code": "cat > .env << 'EOF'\n# --- DATABASE ---\nDB_NAME=mi_db\nDB_USER=mi_usuario\nDB_PASSWORD=mi_password\nDB_HOST=localhost\nDB_PORT=5432\n\n# --- DJANGO ---\nDEBUG=True\nSECRET_KEY=pon-una-seed-larga-y-unica\nALLOWED_HOSTS=127.0.0.1,localhost\nEOF", "fileName": "terminal", "wrap": true },

      { "type": "p", "text": "4) Carga .env en settings. Usa `python-dotenv` y `os.getenv`. Asegúrate de importar `os`." },
      { "type": "snippet", "language": "python", "code": "# config/settings.py\nimport os\nfrom pathlib import Path\nfrom dotenv import load_dotenv\n\nBASE_DIR = Path(__file__).resolve().parent.parent\nload_dotenv(BASE_DIR / \".env\")\n\nDEBUG = os.getenv(\"DEBUG\", \"False\").lower() == \"true\"\nSECRET_KEY = os.getenv(\"SECRET_KEY\", \"change-me\")\nALLOWED_HOSTS = [h.strip() for h in os.getenv(\"ALLOWED_HOSTS\", \"\").split(\",\") if h.strip()] or [\"127.0.0.1\", \"localhost\"]\n\nDATABASES = {\n    \"default\": {\n        \"ENGINE\": \"django.db.backends.postgresql\",\n        \"NAME\": os.getenv(\"DB_NAME\"),\n        \"USER\": os.getenv(\"DB_USER\"),\n        \"PASSWORD\": os.getenv(\"DB_PASSWORD\"),\n        \"HOST\": os.getenv(\"DB_HOST\", \"localhost\"),\n        \"PORT\": os.getenv(\"DB_PORT\", \"5432\"),\n        # Opcional en producción (ej. Railway/Render/AWS RDS):\n        # \"OPTIONS\": {\"sslmode\": \"require\"},\n    }\n}", "fileName": "config/settings.py" },

      { "type": "p", "text": "5) Verifica que Django detecta la conexión (aplica migraciones base y ejecuta)." },
      { "type": "snippet", "language": "bash", "code": "python manage.py check\nyes \"\" | python manage.py makemigrations  # (no crea nada si no hay modelos nuevos)\npython manage.py migrate\npython manage.py runserver 8000", "fileName": "terminal" },

      { "type": "p", "text": "6) Prueba rápida con un modelo simple para confirmar escritura/lectura." },
      { "type": "snippet", "language": "python", "code": "# core/models.py\nfrom django.db import models\n\nclass Ping(models.Model):\n    creado = models.DateTimeField(auto_now_add=True)\n", "fileName": "core/models.py" },
      { "type": "snippet", "language": "bash", "code": "python manage.py makemigrations core\npython manage.py migrate\npython manage.py shell -c \"from core.models import Ping; Ping.objects.create(); print(Ping.objects.count())\"", "fileName": "terminal" },

      { "type": "p", "text": "7) Buenas prácticas para producción." },
      { "type": "p", "text": "• Nunca subas `.env` al repositorio (usa `.gitignore`).\n• Cambia `DEBUG=False`, configura `ALLOWED_HOSTS` y añade `sslmode=require` cuando tu proveedor lo pida.\n• Usa un usuario de DB con permisos mínimos (no superuser) y rota credenciales si hay incidentes.\n• Mantén backups automáticos y monitoreo de conexiones." },

      { "type": "p", "text": "8) Errores comunes y cómo resolverlos (rápido)." },
      { "type": "p", "text": "• `psycopg.OperationalError: connection refused`: Verifica `DB_HOST`, `DB_PORT` y que PostgreSQL esté iniciado.\n• `password authentication failed`: Usuario/clave o `pg_hba.conf` mal configurados.\n• Migraciones atascadas: revisa `python manage.py showmigrations` y asegura que la base apuntada es la correcta.\n• `.env` no cargado: confirma la ruta en `load_dotenv(BASE_DIR / \".env\")` y que `os.getenv` devuelve valores." },

      { "type": "p", "text": "9) (Opcional) Variables de entorno del sistema/servidor. En contenedores o PaaS, define las keys (`DB_NAME`, `DB_USER`, etc.) en el panel y omite el `.env`, o cópialo vía secretos (no en la imagen)." },

      { "type": "p", "text": "Con esto tu Django queda conectado a PostgreSQL mediante variables de entorno gestionadas por dotenv. ¿Quieres que lo dejemos listo con `docker-compose` (Django + Postgres + pgAdmin) y volúmenes persistentes?" }
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/django-postgres-dotenv.png",
    category: "Backend",
    featuredPosts: true
  },
  {
    name: "Conexión SSH: qué necesitas y cómo iniciar sesión de forma segura",
    description: [
      { "type": "p", "text": "Aquí tienes una guía clara para iniciar sesión por SSH a un servidor Linux (Ubuntu/CentOS/Rocky). Incluye: datos que debes pedir/guardar, cómo conectarte desde macOS/Linux y Windows, uso de llaves, archivo ~/.ssh/config, bastion (ProxyJump) y resolución de errores comunes." },

      { "type": "p", "text": "1) Datos que NECESITAS (pídelos al admin o proveedor):\n• Host (IP pública o nombre DNS): ej. 203.0.113.10 o server.midominio.com\n• Usuario del sistema: ej. ubuntu, rocky, deploy, root (mejor NO root)\n• Puerto: por defecto 22 (a veces 2222/22022 por seguridad)\n• Autenticación: contraseña o (recomendado) llave SSH (par privada+pública)\n• Ruta de la llave privada: ej. ~/.ssh/id_ed25519\n• Passphrase de la llave (si tiene)\n• MFA/OTP si tu empresa lo exige\n• (Opcional) Bastion/Jump host si el servidor no es accesible directamente\n• IPs permitidas (si hay firewall o lista blanca)" },

      { "type": "p", "text": "2) Generar una llave SSH (recomendado ED25519). Protege la privada con passphrase." },
      { "type": "snippet", "language": "bash", "code": "ssh-keygen -t ed25519 -C \"tu.email@ejemplo.com\" -f ~/.ssh/id_ed25519\n# Ingresa una passphrase cuando te la pida", "fileName": "terminal" },

      { "type": "p", "text": "3) Copiar tu llave pública al servidor (macOS/Linux con acceso por contraseña)." },
      { "type": "snippet", "language": "bash", "code": "ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@server.midominio.com -p 22", "fileName": "terminal" },
      { "type": "p", "text": "Si no tienes ssh-copy-id, pega el contenido de tu id_ed25519.pub en ~/.ssh/authorized_keys del servidor con permisos 600 y carpeta 700." },

      { "type": "p", "text": "4) Conectarte desde macOS/Linux (contraseña o llave). La primera vez te pedirá confirmar la huella (known_hosts)." },
      { "type": "snippet", "language": "bash", "code": "ssh usuario@server.midominio.com\n# Con puerto custom:\nssh -p 22022 usuario@server.midominio.com\n# Usando llave específica:\nssh -i ~/.ssh/id_ed25519 usuario@server.midominio.com -p 22", "fileName": "terminal" },

      { "type": "p", "text": "5) Windows (PowerShell con OpenSSH nativo). También puedes usar PuTTY, pero OpenSSH es más directo." },
      { "type": "snippet", "language": "bash", "code": "ssh usuario@server.midominio.com -p 22\n# Importar llave (si la generaste en Windows): suele estar en C:\\\\Users\\\\TUUSUARIO\\\\.ssh\\\\id_ed25519", "fileName": "PowerShell" },

      { "type": "p", "text": "6) (Opcional pero recomendado) Configurar ~/.ssh/config para simplificar comandos y forzar buenas prácticas." },
      { "type": "snippet", "language": "bash", "code": "nano ~/.ssh/config\n# Ejemplo:\nHost prod\n  HostName server.midominio.com\n  User deploy\n  Port 22\n  IdentityFile ~/.ssh/id_ed25519\n  IdentitiesOnly yes\n  ForwardAgent no\n  ServerAliveInterval 30\n  ServerAliveCountMax 4", "fileName": "~/.ssh/config" },
      { "type": "p", "text": "Ahora conectas solo con: `ssh prod`." },

      { "type": "p", "text": "7) Acceso vía bastion/jump host (cuando el servidor interno no es público)." },
      { "type": "snippet", "language": "bash", "code": "# ~/.ssh/config\nHost bastion\n  HostName bastion.midominio.com\n  User admin\n  IdentityFile ~/.ssh/id_ed25519\n\nHost app-interna\n  HostName 10.0.2.15\n  User deploy\n  ProxyJump bastion\n  IdentityFile ~/.ssh/id_ed25519", "fileName": "~/.ssh/config" },
      { "type": "p", "text": "Conéctate con: `ssh app-interna` (saltará por el bastion automáticamente)." },

      { "type": "p", "text": "8) Reenvío de puertos (útil para DB/servicios internos). Úsalo solo temporalmente y con cuidado." },
      { "type": "snippet", "language": "bash", "code": "# Accede a PostgreSQL interno 5432 a través del servidor\nssh -L 5432:127.0.0.1:5432 prod\n# Luego, en tu máquina local conecta a localhost:5432", "fileName": "terminal" },

      { "type": "p", "text": "9) Endurecimiento básico (seguridad):\n• Desactiva login por contraseña y root remoto: `PasswordAuthentication no`, `PermitRootLogin no` en /etc/ssh/sshd_config.\n• Usa fail2ban o similar y cambia el puerto si tu política lo permite.\n• Limita IPs con firewall (ufw/firewalld/security-groups).\n• Mantén llaves privadas con permisos 600 y carpeta ~/.ssh con 700.\n• Activa 2FA/MFA si está disponible." },

      { "type": "p", "text": "10) Errores frecuentes y solución rápida:\n• `Permission denied (publickey)`: verifica que la pública esté en `~/.ssh/authorized_keys` del usuario correcto y permisos (600 archivo, 700 carpeta).\n• `No route to host`/`Connection timed out`: revisa IP/puerto, firewall/red, puerto diferente a 22.\n• Cambiaste de IP/host y falla por `REMOTE HOST IDENTIFICATION HAS CHANGED!`: edita `~/.ssh/known_hosts` y elimina la línea del host afectado.\n• `Too many authentication failures`: limita llaves con `IdentitiesOnly yes` y `IdentityFile` explícito.\n• En Windows, si la llave no carga: revisa permisos del archivo y ubicación (`C:\\Users\\TUUSUARIO\\.ssh`)." },

      { "type": "p", "text": "11) Buenas prácticas operativas:\n• Registra en un gestor seguro (Vault/1Password) los datos: host, usuario, puerto, ruta de llave, passphrase, bastion.\n• Usa nombres lógicos en ~/.ssh/config (dev, staging, prod).\n• Evita compartir llaves; cada persona debe tener la suya y revocar al salir del equipo.\n• Rota llaves periódicamente." },

      { "type": "p", "text": "Con esto puedes iniciar sesión SSH de forma segura y repetible. Si me dices tu escenario (bastion, puertos, nube, distro), te dejo un ~/.ssh/config exacto y un checklist de hardening para tu entorno." }
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/ssh-login.png",
    category: "DevOps",
    featuredPosts: true
  },
  {
    name: "Docker: encender todos los contenedores (cuándo y cómo usarlo)",
    description: [
      { "type": "p", "text": "A veces necesitas reactivar RÁPIDO todos tus contenedores tras un reinicio del servidor o al retomar un entorno local. Aquí verás cómo hacerlo con Docker “puro” y con Docker Compose, cuándo es útil y qué precauciones tomar." },

      { "type": "p", "text": "1) Encender *todos* los contenedores con Docker CLI:" },
      { "type": "snippet", "language": "bash", "code": "docker start $(docker ps -a -q)", "fileName": "terminal" },
      { "type": "p", "text": "Explicación breve:\n• `docker ps -a -q` → lista *todos* los contenedores (encendidos y apagados) y devuelve solo sus IDs.\n• `docker start` → inicia los contenedores cuyos IDs le pases.\nResultado: enciende también los que estaban detenidos." },

      { "type": "p", "text": "2) Variantes útiles (seguras y filtradas):" },
      { "type": "snippet", "language": "bash", "code": "# Solo los detenidos (evita tocar los que ya están arriba)\ndocker start $(docker ps -q -f status=exited)\n\n# Evitar error si no hay resultados (GNU xargs)\ndocker ps -aq | xargs -r docker start\n\n# Detener todos (por si necesitas un reset controlado)\ndocker stop $(docker ps -q)", "fileName": "terminal" },

      { "type": "p", "text": "3) Con Docker Compose (recomendado cuando tu proyecto tiene servicios definidos):" },
      { "type": "snippet", "language": "bash", "code": "# Docker Compose v2 (comando moderno)\ndocker compose up -d\n\n# (Compat) Algunos entornos aún usan:\n# docker-compose up -d", "fileName": "terminal" },
      { "type": "p", "text": "Esto levantará todos los servicios definidos en tu `docker-compose.yml`, construyendo imágenes si faltan y respetando dependencias declaradas (`depends_on`)." },

      { "type": "p", "text": "4) ¿Cuándo es ÚTIL encenderlos todos?" },
      { "type": "p", "text": "• **Reinicio del servidor**: quieres volver a poner en línea todo tu stack (DB, backend, frontend, workers) sin recordar cada nombre.\n• **Entorno local de desarrollo**: ayer apagaste todo; hoy retomas y subes todo de un jalón.\n• **Hosts multi-proyecto**: varios contenedores de herramientas (pgAdmin, Redis, Portainer, etc.) y deseas reactivarlos rápido.\n• **Tareas de mantenimiento**: tras actualizar Docker/Kernel, reinicias servicios y verificas salud." },

      { "type": "p", "text": "5) ¿Cuándo NO conviene o hay que tener cuidado?" },
      { "type": "p", "text": "• **Orden de arranque**: bases de datos deben estar listas antes del backend; `docker start` *no* sabe dependencias. Usa `docker compose` para orquestar.\n• **Conflictos de puertos**: al encender todo puedes chocar con puertos ocupados.\n• **Recursos limitados**: levantar todo consume RAM/CPU. Quizá solo necesites 2–3 servicios.\n• **Estados sensibles**: en colas/streams, workers encendidos “a la fuerza” podrían reprocesar o causar eventos inesperados." },

      { "type": "p", "text": "6) Buenas prácticas para producción:" },
      { "type": "p", "text": "• **restart policy**: configura `restart: unless-stopped` (Compose) o `--restart unless-stopped` (CLI) para que los contenedores arranquen con el daemon tras reboot.\n• **Supervisión**: usa healthchecks (`healthcheck:` en Compose) y un orquestador/monitor (Portainer/Watchtower/Prometheus) para detectar fallas.\n• **Menos privilegios**: evita correr como root dentro del contenedor si no es necesario.\n• **Logs/volúmenes**: rota logs y persiste datos en volúmenes, no en el sistema de archivos del contenedor." },

      { "type": "p", "text": "7) Ejemplo minimal de Compose con políticas de reinicio y dependencia:" },
      { "type": "snippet", "language": "yaml", "code": "services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: app\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - dbdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app\"]\n      interval: 5s\n      timeout: 3s\n      retries: 10\n    restart: unless-stopped\n\n  backend:\n    build: ./backend\n    depends_on:\n      db:\n        condition: service_healthy\n    environment:\n      DATABASE_URL: postgresql://app:secret@db:5432/app\n    ports:\n      - \"8000:8000\"\n    restart: unless-stopped\n\nvolumes:\n  dbdata:", "fileName": "docker-compose.yml" },

      { "type": "p", "text": "8) Resumen rápido:" },
      { "type": "p", "text": "• **Comando rápido**: `docker start $(docker ps -a -q)` para encender todo.\n• **Mejor con Compose** si hay dependencias: `docker compose up -d`.\n• **Filtra/evita sorpresas** usando `-f status=exited`, healthchecks y restart policies.\n• **Piensa en orden, puertos y recursos** antes de encender todo a la vez." }
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/docker-start-all.png",
    category: "DevOps",
    featuredPosts: true
  }

];

export const featuredPosts = [
  {
    name:
      "9na reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México",
    date: "11 de diciembre, 2024",
    image:
      "/img/noticias/ZMVM/9na reunión previas actualización del Programa de Ordenamiento de la Zona Metropolitana del Valle de México.jpg",
  },
  {
    name: "Red Nacional Metropolitana 2024 Sexta Edición Día 2",
    date: "29 de noviembre, 2024",
    image:
      "/img/noticias/ZMVM/Red Nacional Metropolitana 2024 Sexta Edición Día 2.jpg",
  },
];

// Función para normalizar nombres (elimina acentos y caracteres especiales)
export const normalizeName = (str) => {
  return str
    .normalize("NFD") // Descompone los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
    .replace(/[^\w\s-]/g, "") // Elimina caracteres especiales
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .toLowerCase(); // Convierte a minúsculas
};

/* ====== Marcado ligero: **negritas**, *cursivas*, `inline code` ====== */

// Mantiene compatibilidad con tu función original
export const renderTextWithStyles = (text) => {
  const combinedRegex = /(\*\*_(.*?)_\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;

  const elements = [];
  let lastIndex = 0;

  String(text).replace(
    combinedRegex,
    (
      match,
      boldItalicContent,
      boldContent,
      italicContent,
      offset
    ) => {
      if (offset > lastIndex) {
        elements.push(String(text).substring(lastIndex, offset));
      }

      if (boldItalicContent) {
        elements.push(
          <strong key={`bi-${offset}`}>
            <em>{boldItalicContent}</em>
          </strong>
        );
      } else if (boldContent) {
        elements.push(<strong key={`b-${offset}`}>{boldContent}</strong>);
      } else if (italicContent) {
        elements.push(<em key={`i-${offset}`}>{italicContent}</em>);
      }

      lastIndex = offset + match.length;
    }
  );

  if (lastIndex < String(text).length) {
    elements.push(String(text).substring(lastIndex));
  }
  return elements;
};

// Inserta <Snippet inline> para backticks y aplica negrita/cursiva al resto
const renderInlineWithStyles = (text) => {
  const parts = String(text).split(/(`[^`]+`)/g);
  return parts.map((seg, i) => {
    if (/^`[^`]+`$/.test(seg)) {
      return (
        <Snippet key={`code-${i}`} inline code={seg.slice(1, -1)} language="txt" />
      );
    }
    return <span key={`t-${i}`}>{renderTextWithStyles(seg)}</span>;
  });
};

/* ====== Fences (bloques de código) en cadenas ====== */

const parseFenceHeader = (rawHeader = "") => {
  // ejemplo: "js file=app.js lines wrap"
  const tokens = rawHeader.trim().split(/\s+/).filter(Boolean);
  const meta = {
    language: "txt",
    fileName: undefined,
    showLineNumbers: false,
    wrap: false,
  };

  if (tokens.length > 0 && !tokens[0].includes("=")) {
    meta.language = tokens.shift();
  }

  for (const t of tokens) {
    if (t.startsWith("file=")) meta.fileName = t.slice(5);
    else if (t === "lines") meta.showLineNumbers = true;
    else if (t === "wrap") meta.wrap = true;
  }
  return meta;
};

/* ====== Render principal (string legacy o array de bloques) ====== */

export const renderDescription = (description) => {
  // 1) Si viene como ARRAY de bloques (nuevo formato)
  if (Array.isArray(description)) {
    return description.map((block, idx) => {
      if (!block || typeof block !== "object") return null;

      switch (block.type) {
        case "p":
          return (
            <li key={`p-${idx}`} className={styles.noBullet}>
              <p className={styles.paragraph}>
                {renderInlineWithStyles(block.text || "")}
              </p>
            </li>
          );

        case "snippet":
          return (
            <li key={`s-${idx}`} className={styles.noBullet}>
              <Snippet
                code={block.code || ""}
                language={block.language || "txt"}
                fileName={block.fileName}
                showLineNumbers={!!block.showLineNumbers}
                wrap={!!block.wrap}
              />
            </li>
          );

        case "ul": {
          const items = Array.isArray(block.items) ? block.items : [];
          return (
            <li key={`ul-${idx}`} className={styles.noBullet}>
              <ul className={styles.list}>
                {items.map((it, j) => (
                  <li key={`uli-${j}`}>
                    {typeof it === "string"
                      ? renderInlineWithStyles(it)
                      : renderInlineWithStyles(it?.text || "")}
                  </li>
                ))}
              </ul>
            </li>
          );
        }

        default:
          return null;
      }
    });
  }

  // 2) Si viene como STRING (compatibilidad con tu formato actual)
  const lines = String(description).split("\n");

  const items = [];
  let i = 0;
  let inFence = false;
  let fenceMeta = null;
  let codeLines = [];

  while (i < lines.length) {
    const line = lines[i];

    // Apertura de fence ```
    const open = line.match(/^\s*```(.*)$/);
    if (open && !inFence) {
      inFence = true;
      fenceMeta = parseFenceHeader(open[1] || "");
      codeLines = [];
      i++;
      continue;
    }

    // Cierre de fence ```
    if (inFence && /^\s*```\s*$/.test(line)) {
      const code = codeLines.join("\n");
      items.push(
        <li key={`fence-${i}`} className={styles.noBullet}>
          <Snippet
            code={code}
            language={fenceMeta.language}
            fileName={fenceMeta.fileName}
            showLineNumbers={fenceMeta.showLineNumbers}
            wrap={fenceMeta.wrap}
          />
        </li>
      );
      inFence = false;
      fenceMeta = null;
      codeLines = [];
      i++;
      continue;
    }

    // Acumular líneas dentro del fence
    if (inFence) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Línea normal
    const trimmed = line.trim();

    // vacío -> saltar (evitamos <br/> dentro de <ul>)
    if (!trimmed) {
      i++;
      continue;
    }

    // Viñeta "* " o "- "
    if (/^\s*[\*\-]\s+/.test(line)) {
      const content = line.replace(/^\s*[\*\-]\s+/, "");
      items.push(
        <li key={`li-${i}`} className={styles.rightAlignedList}>
          {renderInlineWithStyles(content)}
        </li>
      );
      i++;
      continue;
    }

    // Párrafo "normal" (sin viñeta)
    items.push(
      <li key={`p-${i}`} className={styles.noBullet}>
        <p className={styles.paragraph}>{renderInlineWithStyles(line)}</p>
      </li>
    );

    i++;
  }

  return items;
};