const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function toIsoDate(date) {
  const match = /^(\d{1,2}) de ([a-z]+), (\d{4})$/.exec(
    String(date || "").trim().toLowerCase()
  );
  if (!match) throw new Error(`Formato de fecha inválido: ${date}`);

  const day = Number(match[1]);
  const month = MONTHS.indexOf(match[2]) + 1;
  const year = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    !month ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Fecha inválida: ${date}`);
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const rawBlogPosts = [

  {
    name: "Cómo obtener las localidades y asentamientos humanos de Hidalgo usando datos de INEGI",
    description: [
      {
        type: "p",
        text:
          "Cuando empecé a trabajar con información territorial para Hidalgo, me encontré con una duda muy común: **¿una localidad es lo mismo que una colonia?** La respuesta corta es no. Y entender esa diferencia es clave antes de construir cualquier catálogo para formularios, mapas, bases de datos o sistemas de consulta.",
      },
      {
        type: "p",
        text:
          "En este ejercicio armé un paquete en Python para obtener información de **municipios, localidades y asentamientos humanos de Hidalgo**, consumiendo datos del servicio de INEGI y generando archivos listos para usarse en proyectos web, bases de datos o análisis territorial.",
      },
      {
        type: "downloadLink",
        href: "/material/inegi_hidalgo_catalogo/inegi_hidalgo_catalogo.zip",
        text: "Descargar ZIP del proyecto",
        fileName: "inegi_hidalgo_catalogo.zip",
      },

      { type: "h2", text: "Localidades y asentamientos humanos: no son lo mismo" },
      {
        type: "p",
        text:
          "Una **localidad** es una unidad geoestadística. Sirve para ubicar lugares habitados dentro de un municipio y suele tener información como clave, nombre, ámbito urbano/rural, periodo y, en los datos originales, coordenadas, altitud y población.",
      },
      {
        type: "p",
        text:
          "Un **asentamiento humano**, en cambio, es una subdivisión o referencia más específica dentro de una localidad.",
      },
      {
        type: "p",
        text:
          "Por ejemplo, en Pachuca de Soto la estructura correcta no sería simplemente “municipio → colonia”, sino algo más parecido a esto:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "jerarquia-pachuca",
        code:
          "Hidalgo\n└── Pachuca de Soto\n    └── Localidad: Pachuca de Soto\n        ├── Colonia Adolfo López Mateos\n        ├── Colonia Aeropuerto\n        ├── Fraccionamiento 15 de Septiembre\n        └── Barrio / colonia / unidad habitacional...",
      },
      {
        type: "p",
        text: "Es decir, la jerarquía que conviene manejar es:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "jerarquia-correcta",
        code:
          "Entidad\n└── Municipio\n    └── Localidad\n        └── Asentamiento humano",
      },
      {
        type: "p",
        text:
          "En el archivo trabajado, cada municipio contiene localidades, y cada localidad puede contener uno o varios asentamientos humanos. Esa estructura aparece reflejada en el JSON original que se usó como base.",
      },

      { type: "h2", text: "Qué engloba una localidad" },
      {
        type: "p",
        text:
          "Una localidad agrupa un lugar habitado reconocido dentro de un municipio. Puede ser urbana o rural.",
      },
      {
        type: "p",
        text: "En términos prácticos, una localidad puede representar:",
      },
      {
        type: "ul",
        items: [
          "Cabecera municipal",
          "Pueblo",
          "Ranchería",
          "Colonia rural reconocida como localidad",
          "Barrio rural",
          "Conjunto habitado",
        ],
      },
      {
        type: "p",
        text:
          "Por eso hay localidades que se llaman igual que la cabecera municipal, por ejemplo:",
      },
      {
        type: "ul",
        items: [
          "**Municipio:** Pachuca de Soto",
          "**Localidad:** Pachuca de Soto",
        ],
      },
      {
        type: "p",
        text:
          "Pero también puede haber otras localidades dentro del mismo municipio, como barrios, comunidades o zonas rurales.",
      },
      {
        type: "p",
        text: "En el JSON limpio que generé, cada localidad conserva estos campos:",
      },
      {
        type: "snippet",
        language: "json",
        fileName: "localidad.json",
        code:
          "{\n  \"claveGeoestadistica\": \"130480001\",\n  \"claveLocalidad\": \"0001\",\n  \"nombre\": \"Pachuca de Soto\",\n  \"ambito\": \"URBANO\",\n  \"periodo\": \"2015-06-01\",\n  \"tipo\": \"localidad\",\n  \"asentamientosHumanos\": []\n}",
      },
      {
        type: "p",
        text: "Quité de este nivel los campos:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "campos-removidos",
        code: "latitud\nlongitud\naltitud\npob_total",
      },
      {
        type: "p",
        text:
          "porque para el uso final era mejor concentrar la población a nivel municipal y evitar confundir datos de localidad con datos de asentamiento humano.",
      },

      { type: "h2", text: "Qué engloba un asentamiento humano" },
      {
        type: "p",
        text:
          "Un asentamiento humano es el nivel donde normalmente aparecen lo que muchas personas llaman “colonias”.",
      },
      {
        type: "p",
        text: "Pero no todo asentamiento humano es colonia. También puede ser:",
      },
      {
        type: "ul",
        items: [
          "Barrio",
          "Fraccionamiento",
          "Unidad habitacional",
          "Ejido",
          "Pueblo",
          "Ranchería",
          "Residencial",
          "Ampliación",
        ],
      },
      { type: "h2", text: "Cómo obtener la información" },
      {
        type: "p",
        text: "Para obtener la información usé el servicio de INEGI con tres niveles principales:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "niveles",
        code: "Municipios\nLocalidades\nAsentamientos humanos",
      },
      {
        type: "p",
        text: "La lógica del programa es la siguiente:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "flujo",
        code:
          "1. Descargar todos los municipios de Hidalgo.\n2. Recorrer municipio por municipio.\n3. Descargar sus localidades.\n4. Descargar sus asentamientos humanos.\n5. Relacionar asentamientos humanos con localidades.\n6. Generar CSV, JSON y GeoJSON.",
      },
      {
        type: "p",
        text: "La clave de Hidalgo es: ** 13 **",
      },
      {
        type: "p",
        text: "Entonces, a nivel de lógica, el programa trabaja con estas rutas:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "endpoints-inegi",
        code:
          "Municipios de Hidalgo:\nhttps://gaia.inegi.org.mx/wscatgeo/v2/mgem/13\n\nLocalidades por municipio:\nhttps://gaia.inegi.org.mx/wscatgeo/v2/localidades/13/{claveMunicipio}\n\nAsentamientos humanos por municipio:\nhttps://gaia.inegi.org.mx/wscatgeo/v2/asentamientos/13/{claveMunicipio}",
      },
      {
        type: "p",
        text:
          "Por ejemplo, para Pachuca de Soto, cuya clave municipal es `048`, se consultan:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "endpoints-pachuca",
        code:
          "Localidades:\nhttps://gaia.inegi.org.mx/wscatgeo/v2/localidades/13/048\n\nAsentamientos humanos:\nhttps://gaia.inegi.org.mx/wscatgeo/v2/asentamientos/13/048",
      },

      { type: "h2", text: "Cómo funciona el programa" },
      {
        type: "p",
        text: "El paquete tiene una estructura sencilla:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "estructura-paquete",
        code:
          "inegi_hidalgo_catalogo_actualizado/\n├── data/\n│   ├── raw/\n│   ├── dcah/\n│   └── output/\n├── docs/\n├── scripts/\n│   ├── generar_catalogo_hidalgo.py\n│   ├── generar_geojson_enriquecido.py\n│   ├── run_all.py\n│   └── utils_inegi.py\n├── requirements.txt\n├── requirements-geo.txt\n└── README.md",
      },
      {
        type: "p",
        text: "El archivo principal para ejecutar todo es:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "python scripts/run_all.py",
      },
      {
        type: "p",
        text:
          "Este comando primero genera el catálogo tabular y después genera el GeoJSON preliminar.",
      },

      { type: "h2", text: "Instalación" },
      {
        type: "p",
        text: "Primero descomprimo el ZIP y entro a la carpeta:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "cd inegi_hidalgo_catalogo_actualizado",
      },
      {
        type: "p",
        text: "Creo un entorno virtual:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "python -m venv .venv",
      },
      {
        type: "p",
        text: "Lo activo en Linux o macOS:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "source .venv/bin/activate",
      },
      {
        type: "p",
        text: "En Windows PowerShell:",
      },
      {
        type: "snippet",
        language: "powershell",
        fileName: "PowerShell",
        code: ".\\.venv\\Scripts\\Activate.ps1",
      },
      {
        type: "p",
        text: "Instalo las dependencias base:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "pip install -r requirements.txt",
      },
      {
        type: "p",
        text: "Y ejecuto todo:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "python scripts/run_all.py",
      },

      { type: "h2", text: "Qué archivos se obtienen" },
      {
        type: "p",
        text: "Al ejecutar el programa se generan los archivos dentro de:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "output",
        code: "data/output/",
      },
      {
        type: "p",
        text: "Los archivos principales son:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "archivos-generados",
        code:
          "hidalgo_localidades.csv\nhidalgo_asentamientos_humanos.csv\nhidalgo_asentamientos_humanos_localidades.csv\nhidalgo_asentamientos_humanos_localidades.json\nhidalgo_asentamientos_humanos_enriquecido.geojson\nhidalgo_asentamientos_humanos_enriquecido_puntos.geojson",
      },

      { type: "h3", text: "1. `hidalgo_localidades.csv`" },
      {
        type: "p",
        text:
          "Este archivo contiene las localidades de Hidalgo por municipio. Sirve si necesito revisar solamente el nivel de localidad.",
      },
      {
        type: "p",
        text: "Incluye campos como:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "campos-localidades",
        code:
          "cve_ent\nnom_ent\ncve_mun\nnom_mun\ncve_loc\nnom_loc\nambito\nlatitud\nlongitud\naltitud\npob_total\nperiodo\ncvegeo_loc",
      },
      {
        type: "p",
        text:
          "Este archivo conserva los campos completos de localidad porque es el CSV técnico base.",
      },

      { type: "h3", text: "2. `hidalgo_asentamientos_humanos.csv`" },
      {
        type: "p",
        text:
          "Este archivo contiene los asentamientos humanos por municipio y localidad.",
      },
      {
        type: "p",
        text:
          "Sirve si necesito trabajar directamente con colonias, barrios, fraccionamientos, rancherías, pueblos, ejidos y demás tipos de asentamiento.",
      },
      {
        type: "p",
        text: "Incluye campos como:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "campos-asentamientos",
        code:
          "cve_ent\nnom_ent\ncve_mun\nnom_mun\ncve_loc\nnom_loc\ncve_asen\nnom_asen\ntipo_asen\nperiodo\ncvegeo_loc\ncvegeo_asen",
      },
      {
        type: "p",
        text:
          "También conserva algunos campos heredados de localidad para facilitar cruces técnicos.",
      },

      { type: "h3", text: "3. `hidalgo_asentamientos_humanos_localidades.csv`" },
      {
        type: "p",
        text:
          "Este fue el archivo que faltaba y lo agregué al paquete. Es un CSV combinado, pensado para usarlo en Excel, bases de datos o importaciones rápidas.",
      },
      {
        type: "p",
        text: "Tiene una estructura plana:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "campos-csv-combinado",
        code:
          "estado\nclaveEntidad\nmunicipio\nclaveMunicipio\nclaveGeoestadisticaMunicipio\nlocalidad\nclaveLocalidad\nclaveGeoestadisticaLocalidad\nambito\nperiodoLocalidad\nasentamientoHumano\nclaveAsentamiento\ntipoAsentamiento\nperiodoAsentamiento\nclaveGeoestadisticaAsentamiento\ntipoRegistro",
      },
      {
        type: "p",
        text: "La regla es:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "regla-csv-combinado",
        code:
          "Si una localidad tiene asentamientos humanos:\n    genera una fila por cada asentamiento.\n\nSi una localidad no tiene asentamientos humanos:\n    genera una fila con tipoRegistro = localidad_sin_asentamiento.",
      },
      {
        type: "p",
        text: "Este archivo no incluye:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "campos-excluidos",
        code: "latitud\nlongitud\naltitud\npob_total",
      },
      {
        type: "p",
        text:
          "porque la intención fue dejar la información limpia para consulta administrativa y no mezclar población o coordenadas a nivel incorrecto.",
      },

      { type: "h3", text: "4. `hidalgo_asentamientos_humanos_localidades.json`" },
      {
        type: "p",
        text:
          "Este es el archivo más útil para frontend, APIs o selects dependientes.",
      },
      {
        type: "p",
        text: "Tiene esta estructura:",
      },
      {
        type: "snippet",
        language: "json",
        fileName: "hidalgo_asentamientos_humanos_localidades.json",
        code:
          "{\n  \"estado\": \"Hidalgo\",\n  \"claveEntidad\": \"13\",\n  \"claveGeoestadistica\": \"13\",\n  \"tipo\": \"catalogo_asentamientos_humanos_localidades\",\n  \"municipios\": [\n    {\n      \"municipio\": \"Pachuca de Soto\",\n      \"claveMunicipio\": \"048\",\n      \"claveGeoestadistica\": \"13048\",\n      \"localidades\": [\n        {\n          \"claveGeoestadistica\": \"130480001\",\n          \"claveLocalidad\": \"0001\",\n          \"nombre\": \"Pachuca de Soto\",\n          \"ambito\": \"URBANO\",\n          \"periodo\": \"2015-06-01\",\n          \"tipo\": \"localidad\",\n          \"asentamientosHumanos\": [\n            {\n              \"claveAsentamiento\": \"0152\",\n              \"nombre\": \"ADOLFO LÓPEZ MATEOS\",\n              \"tipoAsentamiento\": \"COLONIA\",\n              \"periodo\": \"11/2024\",\n              \"claveGeoestadistica\": \"1304800010152\",\n              \"claveLocalidad\": \"0001\",\n              \"claveGeoestadisticaLocalidad\": \"130480001\",\n              \"localidad\": \"Pachuca de Soto\",\n              \"tipo\": \"asentamiento\"\n            }\n          ]\n        }\n      ],\n      \"resumen\": {\n        \"total\": 35,\n        \"localidades\": 35,\n        \"asentamientos\": 430,\n        \"urbanas\": 3,\n        \"rurales\": 32,\n        \"poblacionTotal\": 314313\n      }\n    }\n  ]\n}",
      },
      {
        type: "p",
        text: "Este JSON permite hacer una interfaz como:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "flujo-selects",
        code:
          "Selecciona municipio\n→ Selecciona localidad\n→ Selecciona asentamiento humano",
      },

      { type: "h3", text: "5. `hidalgo_asentamientos_humanos_enriquecido.geojson`" },
      {
        type: "p",
        text:
          "Este archivo sirve para mapas. Por defecto, si no se usa una capa DCAH, el programa genera puntos preliminares usando la coordenada de la localidad asociada.",
      },
      {
        type: "p",
        text:
          "Eso quiere decir que el punto no representa la geometría exacta de la colonia o asentamiento humano, sino una referencia espacial aproximada.",
      },
      {
        type: "p",
        text: "Para generar el GeoJSON básico:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "python scripts/generar_geojson_enriquecido.py --geometry punto",
      },

      { type: "h2", text: "Cómo generar polígonos reales de asentamientos humanos" },
      {
        type: "p",
        text:
          "Para tener geometría real de colonias o asentamientos, se necesita la capa DCAH de INEGI.",
      },
      {
        type: "p",
        text: "En ese caso, el paquete incluye este comando:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code:
          "python scripts/generar_geojson_enriquecido.py --dcah /ruta/a/DCAH.shp --geometry poligono",
      },
      {
        type: "p",
        text: "Esto genera:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "geojson-poligonos",
        code:
          "hidalgo_asentamientos_humanos_enriquecido_poligonos.geojson\nhidalgo_asentamientos_humanos_enriquecido.geojson",
      },
      {
        type: "p",
        text: "Si quiero generar puntos y polígonos al mismo tiempo:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code:
          "python scripts/generar_geojson_enriquecido.py --dcah /ruta/a/DCAH.shp --geometry both",
      },
      {
        type: "p",
        text: "Y se obtienen:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "geojson-both",
        code:
          "hidalgo_asentamientos_humanos_enriquecido_puntos.geojson\nhidalgo_asentamientos_humanos_enriquecido_poligonos.geojson\nhidalgo_asentamientos_humanos_enriquecido.geojson",
      },

      { type: "h2", text: "Conclusión" },
      {
        type: "p",
        text:
          "Este proceso me permitió ordenar correctamente la información territorial de Hidalgo usando datos de INEGI. La parte más importante fue entender que **localidad** y **asentamiento humano** no son lo mismo.",
      },
      {
        type: "p",
        text:
          "La localidad sirve como unidad geoestadística base. El asentamiento humano representa un nivel más específico, donde aparecen colonias, barrios, fraccionamientos, rancherías, pueblos, ejidos y otras formas de ocupación territorial.",
      },
      {
        type: "p",
        text:
          "Para explicarlo de forma sencilla, utilicé una analogía parecida a una dirección: no se llega directamente a una colonia sin antes ubicar el **estado**, el **municipio** y la **localidad**. De la misma manera, en los datos de INEGI, un asentamiento humano está asociado a una localidad mediante la clave `cve_loc`. Esto permite organizar la información de forma jerárquica y entender que colonias, barrios, fraccionamientos o rancherías forman parte de una localidad específica dentro de un municipio.",
      },
      {
        type: "p",
        text:
          "El paquete final permite generar archivos CSV, JSON y GeoJSON, y deja lista la información para integrarse en un sistema web, una base de datos o un mapa interactivo.",
      },

      {
        type: "p",
        text: "La mayor ventaja es que el catálogo respeta la jerarquía correcta:",
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "jerarquia-final",
        code: "Estado → Municipio → Localidad → Asentamiento humano",
      },
      {
        type: "p",
        text:
          "Y evita un error común: tratar todas las colonias como si fueran localidades o asignar población de localidad directamente a una colonia.",
      },
      {
        type: "downloadLink",
        href: "/material/inegi_hidalgo_catalogo/inegi_hidalgo_catalogo.zip",
        text: "Descargar ZIP del proyecto",
        fileName: "inegi_hidalgo_catalogo.zip",
      },
    ],
    date: "9 de junio, 2026",
    image: "/img/tutoriales/inegi-hidalgo-catalogo.png",
    category: "Tutoriales",
    featuredPosts: true,
  },
  {
    name: "Cómo mostrar archivos ocultos en CyberArk usando WinSCP",
    description: [
      {
        type: "p",
        text: "Cuando trabajo con servidores a través de CyberArk y necesito revisar archivos ocultos, como .env, .gitignore, carpetas .ssh o archivos de configuración internos, una de las formas más prácticas es activar la visualización de archivos ocultos directamente desde WinSCP.",
      },
      {
        type: "p",
        text: "Esto es útil porque, aunque CyberArk controle el acceso seguro al servidor, la visualización de archivos dentro de la sesión depende de la herramienta que se esté utilizando. Si la conexión se abre con WinSCP, la opción debe activarse desde las preferencias de WinSCP.",
      },

      {
        type: "h2",
        text: "1. Entro a la sesión desde CyberArk",
      },
      {
        type: "p",
        text: "Primero ingreso a CyberArk y abro la conexión correspondiente al servidor. Dependiendo de la configuración, CyberArk puede iniciar una sesión segura usando WinSCP para conectarse al servidor mediante SFTP.",
      },
      {
        type: "p",
        text: "Una vez abierta la sesión, WinSCP mostrará el explorador de archivos del servidor, normalmente dividido en dos paneles: archivos locales y archivos remotos.",
      },

      {
        type: "h2",
        text: "2. Identifico si los archivos ocultos no se están mostrando",
      },
      {
        type: "p",
        text: "En sistemas Linux, los archivos ocultos normalmente comienzan con un punto. Algunos ejemplos comunes son:",
      },
      {
        type: "code",
        language: "txt",
        text: ".env\n.gitignore\n.htaccess\n.ssh\n.config",
      },
      {
        type: "p",
        text: "Si sé que el archivo existe en la ruta, pero no aparece dentro del panel de WinSCP, lo más probable es que la opción de mostrar archivos ocultos esté desactivada.",
      },

      {
        type: "h2",
        text: "3. Activo los archivos ocultos desde las preferencias",
      },
      {
        type: "p",
        text: "Para activar la visualización de archivos ocultos en WinSCP, entro al menú de configuración de la aplicación.",
      },
      {
        type: "code",
        language: "txt",
        text: "Options > Preferences > Panels > Show hidden files",
      },
      {
        type: "p",
        text: "Dentro de Preferences, busco la sección Panels y activo la opción Show hidden files. Esta opción permite que WinSCP muestre archivos y carpetas ocultas dentro del panel remoto.",
      },

      {
        type: "h2",
        text: "4. Uso el atajo rápido si quiero hacerlo más rápido",
      },
      {
        type: "p",
        text: "También puedo activar o desactivar la visualización de archivos ocultos usando el atajo de teclado de WinSCP.",
      },
      {
        type: "code",
        language: "txt",
        text: "Ctrl + Alt + H",
      },
      {
        type: "p",
        text: "Este atajo alterna la visibilidad de archivos ocultos. Si lo presiono una vez, los muestra; si lo vuelvo a presionar, los oculta nuevamente.",
      },

      {
        type: "h2",
        text: "5. Actualizo el panel remoto",
      },
      {
        type: "p",
        text: "Después de activar la opción, reviso nuevamente la carpeta remota. Si el archivo todavía no aparece, puedo actualizar el panel o cambiar de carpeta y regresar.",
      },
      {
        type: "p",
        text: "En algunos casos también es necesario cerrar y volver a abrir la sesión, especialmente si CyberArk abrió WinSCP con una configuración temporal o restringida.",
      },

      {
        type: "h2",
        text: "6. Verifico la ruta correcta",
      },
      {
        type: "p",
        text: "Si estoy buscando un archivo como .env, debo asegurarme de estar en la ruta correcta del proyecto. Por ejemplo, en un despliegue con Django o Next.js, el archivo puede estar en la raíz del backend, del frontend o dentro de una carpeta específica del servidor.",
      },
      {
        type: "code",
        language: "txt",
        text: "/home/desarrollo/proyecto/backend/.env\n/home/desarrollo/proyecto/frontend/.env\n/var/www/proyecto/.env",
      },
      {
        type: "p",
        text: "Si el archivo no aparece después de activar archivos ocultos, puede que no exista en esa ruta o que el usuario de conexión no tenga permisos para visualizarlo.",
      },

      {
        type: "h2",
        text: "7. Considero permisos y restricciones de CyberArk",
      },
      {
        type: "p",
        text: "CyberArk puede aplicar políticas de seguridad sobre la sesión. Por eso, aunque WinSCP tenga activada la opción de mostrar archivos ocultos, algunos archivos podrían no verse si el usuario no tiene permisos suficientes en el servidor.",
      },
      {
        type: "p",
        text: "En ese caso, no es un problema de WinSCP, sino de permisos del usuario, políticas de CyberArk o restricciones configuradas para la cuenta privilegiada.",
      },

      {
        type: "h2",
        text: "Resumen rápido",
      },
      {
        type: "p",
        text: "Si estoy usando CyberArk con WinSCP y necesito ver archivos ocultos, el flujo recomendado es:",
      },
      {
        type: "code",
        language: "txt",
        text: "1. Abrir la sesión desde CyberArk.\n2. Confirmar que WinSCP está mostrando el panel remoto.\n3. Ir a Options > Preferences > Panels.\n4. Activar Show hidden files.\n5. O usar Ctrl + Alt + H.\n6. Actualizar la carpeta remota.\n7. Verificar permisos si el archivo no aparece.",
      },

    ],
    date: "05 de junio, 2026",
    image: "/img/tutoriales/cyberark-winscp-hidden-files.png",
    category: "Seguridad",
    featuredPosts: true,
  },
  {
    name: "Guía paso a paso: crea tu proyecto con Next.js 16",
    description: [
      {
        type: "p",
        text: "Cuando inicio un proyecto nuevo con Next.js 16, no solo pienso en levantar una aplicación rápido. También me interesa que el proyecto quede ordenado desde el principio, que sea fácil de mantener y que pueda crecer sin convertirse en una estructura difícil de entender.",
      },
      {
        type: "p",
        text: "Por eso sigo una metodología clara: crear el proyecto con una configuración limpia, usar src/, trabajar con App Router, mantener una estructura modular y dejar una base preparada para escalar.",
      },
      {
        type: "p",
        text: "Esta configuración me permite trabajar con componentes organizados, rutas claras, estilos controlados con CSS Modules y una arquitectura compatible con proyectos institucionales, portafolios, dashboards o aplicaciones conectadas a una API.",
      },

      {
        type: "h2",
        text: "1. Verifico mi versión de Node.js",
      },
      {
        type: "p",
        text: "Antes de crear el proyecto, reviso que mi entorno tenga una versión compatible de Node.js.",
      },
      {
        type: "code",
        language: "bash",
        text: "node -v",
      },
      {
        type: "p",
        text: "Esto me permite confirmar que puedo trabajar sin problemas con las versiones actuales de Next.js y evitar errores desde la instalación.",
      },

      {
        type: "h2",
        text: "2. Creo el proyecto con create-next-app",
      },
      {
        type: "p",
        text: "Para crear el proyecto, uso el siguiente comando:",
      },
      {
        type: "code",
        language: "bash",
        text: "npx create-next-app@latest nombre-del-proyecto",
      },
      {
        type: "p",
        text: "Ejemplo:",
      },
      {
        type: "code",
        language: "bash",
        text: "npx create-next-app@latest mi-proyecto-next",
      },
      {
        type: "p",
        text: "Este comando inicia un asistente en terminal que me permite definir la configuración inicial del proyecto.",
      },

      {
        type: "h2",
        text: "3. Selecciono si quiero usar la configuración recomendada",
      },
      {
        type: "p",
        text: "Al iniciar el asistente, Next.js puede preguntar si quiero usar la configuración recomendada o personalizar el proyecto.",
      },
      {
        type: "code",
        language: "txt",
        text: "What is your project named? mi-proyecto-next\nWould you like to use the recommended Next.js defaults?\n  Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md\n  No, reuse previous settings\n  No, customize settings - Choose your own preferences",
      },
      {
        type: "p",
        text: "En mi caso, normalmente elijo personalizar la configuración, porque prefiero trabajar con JavaScript, CSS Modules y una estructura más controlada desde el inicio.",
      },

      {
        type: "h2",
        text: "4. Personalizo la configuración del proyecto",
      },
      {
        type: "p",
        text: "Cuando quiero un proyecto con JavaScript, App Router y una estructura limpia, suelo responder de esta forma:",
      },
      {
        type: "code",
        language: "txt",
        text: "Would you like to use TypeScript? No\nWhich linter would you like to use? ESLint\nWould you like to use React Compiler? No\nWould you like to use Tailwind CSS? No\nWould you like your code inside a `src/` directory? Yes\nWould you like to use App Router? Yes\nWould you like to customize the import alias? No",
      },
      {
        type: "p",
        text: "Uso esta configuración porque me permite trabajar de forma ordenada sin agregar herramientas que no necesito desde el inicio.",
      },

      {
        type: "h2",
        text: "5. Decido si incluyo AGENTS.md",
      },
      {
        type: "p",
        text: "En versiones recientes del asistente también puede aparecer una pregunta relacionada con AGENTS.md. Este archivo sirve como guía para asistentes de código o agentes de IA dentro del proyecto.",
      },
      {
        type: "code",
        language: "txt",
        text: "Would you like to include AGENTS.md to guide coding agents to write up-to-date Next.js code? Yes / No",
      },
      {
        type: "p",
        text: "Si el proyecto lo voy a trabajar con apoyo de herramientas de IA o quiero dejar instrucciones internas para mantener consistencia, puedo seleccionar Yes. Si quiero una estructura más mínima, puedo seleccionar No.",
      },
      {
        type: "p",
        text: "Para proyectos personales, portafolios o pruebas rápidas, puedo omitirlo. Para proyectos más grandes o colaborativos, sí puede ser útil incluirlo.",
      },

      {
        type: "h2",
        text: "6. Configuración que normalmente recomiendo para mi flujo",
      },
      {
        type: "p",
        text: "Para mi forma de trabajar, una configuración base sólida sería la siguiente:",
      },
      {
        type: "code",
        language: "txt",
        text: "TypeScript: No\nLinter: ESLint\nReact Compiler: No\nTailwind CSS: No\nsrc/ directory: Yes\nApp Router: Yes\nCustomize import alias: No\nImport alias: @/*\nAGENTS.md: Opcional",
      },
      {
        type: "p",
        text: "Con esto el proyecto queda preparado para trabajar con JavaScript, rutas modernas con App Router, imports limpios usando @/* y estilos separados mediante CSS Modules.",
      },

      {
        type: "h2",
        text: "7. Entro a la carpeta del proyecto",
      },
      {
        type: "p",
        text: "Después de crear el proyecto, entro a la carpeta generada:",
      },
      {
        type: "code",
        language: "bash",
        text: "cd mi-proyecto-next",
      },

      {
        type: "h2",
        text: "8. Levanto el servidor de desarrollo",
      },
      {
        type: "p",
        text: "Para iniciar el proyecto en modo desarrollo, ejecuto:",
      },
      {
        type: "code",
        language: "bash",
        text: "npm run dev",
      },
      {
        type: "p",
        text: "Después abro el navegador en:",
      },
      {
        type: "code",
        language: "txt",
        text: "http://localhost:3000",
      },

      {
        type: "h2",
        text: "9. Reviso la estructura inicial",
      },
      {
        type: "p",
        text: "Al usar src/ y App Router, la estructura inicial del proyecto queda más ordenada. Una base común puede verse así:",
      },
      {
        type: "code",
        language: "txt",
        text: "mi-proyecto-next/\n├── public/\n├── src/\n│   └── app/\n│       ├── favicon.ico\n│       ├── globals.css\n│       ├── layout.js\n│       └── page.js\n├── eslint.config.mjs\n├── jsconfig.json\n├── next.config.mjs\n├── package.json\n└── README.md",
      },
      {
        type: "p",
        text: "A partir de esta base puedo crear carpetas como components, shared, styles, utils o services, dependiendo del tamaño y objetivo del proyecto.",
      },

      {
        type: "h2",
        text: "10. Estructura recomendada para seguir creciendo",
      },
      {
        type: "p",
        text: "Para un proyecto de portafolio, landing page o aplicación institucional, normalmente puedo organizar el código de esta manera:",
      },
      {
        type: "code",
        language: "txt",
        text: "src/\n├── app/\n│   ├── layout.js\n│   ├── page.js\n│   └── globals.css\n├── components/\n│   └── NombreComponente/\n│       ├── NombreComponente.js\n│       └── NombreComponente.module.css\n├── shared/\n│   ├── Navbar.js\n│   └── Footer.js\n├── data/\n│   └── contenido.js\n└── utils/\n    └── helpers.js",
      },
      {
        type: "p",
        text: "Esta estructura me ayuda a separar componentes, datos, estilos y utilidades. Así evito que todo quede mezclado dentro de app/ y puedo mantener el proyecto más limpio conforme crece.",
      },

      {
        type: "h2",
        text: "11. Creo mis primeros componentes",
      },
      {
        type: "p",
        text: "Cuando agrego un componente nuevo, prefiero colocarlo dentro de una carpeta propia junto con su archivo CSS Module.",
      },
      {
        type: "code",
        language: "txt",
        text: "components/\n└── Hero/\n    ├── Hero.js\n    └── Hero.module.css",
      },
      {
        type: "p",
        text: "Esto me permite mantener cada componente aislado, fácil de mover, reutilizar o modificar sin afectar otras secciones del proyecto.",
      },

      {
        type: "h2",
        text: "12. Uso CSS Modules para mantener estilos controlados",
      },
      {
        type: "p",
        text: "Como no uso Tailwind en esta configuración, trabajo con CSS Modules para tener estilos encapsulados por componente.",
      },
      {
        type: "code",
        language: "jsx",
        text: "import styles from \"./Hero.module.css\";\n\nexport default function Hero() {\n  return (\n    <section className={styles.hero}>\n      <h1>Mi proyecto en Next.js 16</h1>\n    </section>\n  );\n}",
      },
      {
        type: "p",
        text: "Este enfoque evita conflictos de nombres entre clases y hace que el mantenimiento visual sea más claro.",
      },

      {
        type: "h2",
        text: "Conclusión",
      },
      {
        type: "p",
        text: "Crear un proyecto con Next.js 16 es sencillo, pero hacerlo con una metodología clara desde el inicio ayuda a mantener el proyecto más ordenado, más fácil de escalar y más cómodo de mantener.",
      },
      {
        type: "p",
        text: "Mi flujo base es:",
      },
      {
        type: "code",
        language: "bash",
        text: "npx create-next-app@latest mi-proyecto-next\ncd mi-proyecto-next\nnpm run dev",
      },
      {
        type: "p",
        text: "A partir de ahí, puedo comenzar a construir el proyecto con una estructura limpia, componentes bien organizados, estilos controlados con CSS Modules y una base preparada para crecer conforme se agreguen nuevas páginas, secciones, datos y conexiones con APIs.",
      },
    ],
    date: "27 de mayo, 2026",
    image: "/img/tutoriales/nextjs-setup-16.png",
    category: "Tutoriales",
    featuredPosts: true,
  },
  {
    name: "Cómo organizo mis commits en Git y por qué uso esta metodología",
    description: [
      {
        type: "p",
        text:
          "Cuando trabajo en un proyecto, no solo me interesa que el código funcione. También me interesa que el historial de cambios sea claro, ordenado y fácil de entender. Por eso utilizo una metodología para escribir mis commits basada en una estructura simple:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "tipo(área): descripción del cambio"`,
      },
      {
        type: "p",
        text: "Por ejemplo:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "content(blog): agrega nueva nota sobre buenas prácticas en Git"`,
      },
      {
        type: "p",
        text:
          "Esta forma de escribir commits me ayuda a identificar rápidamente qué tipo de cambio hice, en qué parte del proyecto ocurrió y cuál fue el propósito del ajuste.",
      },

      {
        type: "h2",
        text: "¿Por qué no escribo commits genéricos?",
      },
      {
        type: "p",
        text: "Antes podría parecer suficiente escribir mensajes como:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "cambios"`,
      },
      {
        type: "p",
        text: "o:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "actualización"`,
      },
      {
        type: "p",
        text:
          "Pero este tipo de mensajes no explica realmente qué se modificó. Cuando el proyecto crece, estos commits se vuelven difíciles de revisar porque no permiten saber si el cambio fue una corrección, una nueva funcionalidad, una mejora visual, documentación o simplemente contenido nuevo.",
      },
      {
        type: "p",
        text:
          "Por eso prefiero usar una metodología más clara y descriptiva.",
      },

      {
        type: "h2",
        text: "Tipos de commits que utilizo",
      },
      {
        type: "p",
        text:
          "La idea es clasificar cada cambio según su intención. Algunos de los tipos más comunes que uso son:",
      },
      {
        type: "ul",
        items: [
          "**feat:** nueva funcionalidad",
          "**fix:** corrección de errores",
          "**refactor:** mejora interna del código",
          "**style:** cambios visuales o de formato",
          "**docs:** documentación",
          "**content:** contenido nuevo o modificación de textos",
          "**chore:** tareas de mantenimiento",
          "**build:** cambios de compilación o configuración",
          "**ci:** integración continua o despliegue",
          "**perf:** mejoras de rendimiento",
          "**test:** pruebas",
        ],
      },
      {
        type: "p",
        text:
          "Esta clasificación me permite leer el historial del proyecto y entender rápidamente qué pasó en cada etapa.",
      },

      {
        type: "h2",
        text: "Por qué uso `content` para textos o notas de blog",
      },
      {
        type: "p",
        text:
          "Cuando agrego una nueva nota en un blog, muchas veces no estoy creando una funcionalidad nueva como tal. Lo que estoy haciendo es agregar contenido visible para el usuario.",
      },
      {
        type: "p",
        text: "Por eso, en lugar de usar siempre `feat`, prefiero usar:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "content(blog): agrega nueva nota"`,
      },
      {
        type: "p",
        text:
          "Este mensaje es más preciso, porque indica que el cambio corresponde a contenido dentro del blog.",
      },
      {
        type: "p",
        text:
          "Si la nota trata sobre un tema específico, puedo hacerlo todavía más claro:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "content(blog): agrega nota sobre configuración de subdominios"`,
      },
      {
        type: "p",
        text:
          "De esta forma, cuando revise el historial, podré saber exactamente qué contenido se agregó sin tener que abrir el commit completo.",
      },

      {
        type: "h2",
        text: "Cuándo uso `feat`",
      },
      {
        type: "p",
        text:
          "Uso `feat` cuando realmente estoy agregando una funcionalidad nueva al sistema. Por ejemplo:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "feat(blog): agrega buscador de notas"`,
      },
      {
        type: "p",
        text:
          "En este caso sí se trata de una funcionalidad nueva, porque el usuario podrá buscar publicaciones dentro del blog.",
      },
      {
        type: "p",
        text:
          "Pero si solo agrego texto, una nueva entrada o actualizo contenido, prefiero usar `content`.",
      },

      {
        type: "h2",
        text: "Cuándo uso `docs`",
      },
      {
        type: "p",
        text:
          "Uso `docs` cuando el cambio corresponde a documentación técnica, como instrucciones de instalación, configuración del proyecto, uso de comandos o explicación para desarrolladores.",
      },
      {
        type: "p",
        text: "Por ejemplo:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "docs: agrega guía de instalación del proyecto"`,
      },
      {
        type: "p",
        text:
          "La diferencia principal es que `docs` se enfoca en documentación del proyecto, mientras que `content` se enfoca en contenido visible o editorial, como textos de páginas, notas, artículos o publicaciones.",
      },

      {
        type: "h2",
        text: "Ventajas de usar esta metodología",
      },
      {
        type: "p",
        text:
          "Usar esta forma de escribir commits me ayuda a mantener un historial mucho más profesional y entendible.",
      },
      {
        type: "p",
        text: "Entre las principales ventajas están:",
      },
      {
        type: "ul",
        items: [
          "**Mayor claridad:** cada commit explica qué se hizo.",
          "**Mejor organización:** puedo identificar cambios por tipo y área.",
          "**Facilidad para revisar errores:** si algo falla, puedo ubicar más rápido qué commit pudo haberlo causado.",
          "**Historial más limpio:** evito mensajes genéricos como “cambios” o “actualización”.",
          "**Mejor trabajo en equipo:** otras personas pueden entender el avance del proyecto sin preguntarme directamente.",
        ],
      },

      {
        type: "h2",
        text: "Ejemplos prácticos",
      },
      {
        type: "p",
        text: "Si agrego una nueva nota al blog:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "content(blog): agrega nueva nota"`,
      },
      {
        type: "p",
        text: "Si corrijo un error en el formulario:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "fix(form): corrige validación de campos obligatorios"`,
      },
      {
        type: "p",
        text: "Si agrego una nueva sección al sitio:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "feat(home): agrega sección de noticias"`,
      },
      {
        type: "p",
        text: "Si solo ajusto estilos:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "style(navbar): ajusta espaciado en versión móvil"`,
      },
      {
        type: "p",
        text:
          "Si mejoro el código sin cambiar lo que ve el usuario:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "refactor(api): simplifica manejo de respuestas"`,
      },

      {
        type: "h2",
        text: "Conclusión",
      },
      {
        type: "p",
        text:
          "Utilizo esta metodología porque me permite trabajar de forma más ordenada y profesional. Un buen commit no solo guarda cambios en Git; también documenta la evolución del proyecto.",
      },
      {
        type: "p",
        text:
          "Por eso, cuando agrego contenido a un blog, prefiero usar un mensaje como:",
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: `git commit -m "content(blog): agrega nueva nota"`,
      },
      {
        type: "p",
        text:
          "Es claro, específico y describe correctamente el tipo de cambio realizado. De esta manera, el historial del proyecto se mantiene limpio, entendible y útil para futuras revisiones.",
      },
    ],
    date: "20 de mayo, 2026",
    image: "/img/tutoriales/git-commits-buenas-practicas.png",
    category: "Tutoriales",
    featuredPosts: true,
  },
  {
    name: "Tutorial: Cómo conectar un subdominio personalizado a un proyecto desplegado en Vercel",
    description: [
      {
        type: "p",
        text:
          "En este tutorial aprenderás a conectar un subdominio personalizado a un proyecto que ya tienes desplegado en **Vercel**, usando un registro DNS tipo **CNAME**."
      },
      {
        type: "p",
        text: "La idea es que tu proyecto pueda abrirse desde una dirección como esta:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url",
        code: "https://subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Por ejemplo, si tu dominio fuera:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio",
        code: "gabrielgomez.site"
      },
      {
        type: "p",
        text: "y quisieras crear el subdominio:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "subdominio",
        code: "dashboard-metricas"
      },
      {
        type: "p",
        text: "entonces la dirección final sería:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url-final",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "En tu caso deberás reemplazar `gabrielgomez.site` por tu propio dominio."
      },

      { type: "h2", text: "1. Conceptos básicos" },
      {
        type: "p",
        text: "Antes de configurar el dominio, conviene entender qué significa cada parte."
      },

      { type: "h3", text: "Dominio principal" },
      {
        type: "p",
        text: "Es el dominio base que compraste o administras."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio",
        code: "gabrielgomez.site"
      },
      {
        type: "p",
        text: "En tu caso sería algo como:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio",
        code: "tudominio.com"
      },

      { type: "h3", text: "Subdominio" },
      {
        type: "p",
        text: "Es una palabra o nombre que se coloca antes del dominio principal."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "subdominio",
        code: "dashboard-metricas"
      },
      {
        type: "p",
        text: "Al unirlo con el dominio principal, queda así:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url-final",
        code: "dashboard-metricas.gabrielgomez.site"
      },

      { type: "h3", text: "Registro CNAME" },
      {
        type: "p",
        text:
          "Un registro **CNAME** sirve para indicar que un subdominio debe apuntar hacia otro dominio o servicio."
      },
      {
        type: "p",
        text: "En este caso, el subdominio apuntará a **Vercel**."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname",
        code: "dashboard-metricas.gabrielgomez.site → cname.vercel-dns.com"
      },

      { type: "h2", text: "2. Agregar el dominio en Vercel" },
      {
        type: "p",
        text: "Primero debes entrar al proyecto que tienes desplegado en Vercel."
      },
      {
        type: "p",
        text: "Ve a:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "ruta-vercel",
        code: "Vercel → Tu proyecto → Settings → Domains"
      },
      {
        type: "p",
        text: "Después da clic en:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "acción",
        code: "Add Domain"
      },
      {
        type: "p",
        text: "Ahí escribe el subdominio completo que quieres conectar."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-vercel",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "En tu caso deberás escribir:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-vercel",
        code: "subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Por ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "ejemplos-subdominio",
        code: "app.tudominio.com\npanel.tudominio.com\ndashboard.tudominio.com\nsistema.tudominio.com"
      },
      {
        type: "p",
        text:
          "Después de agregarlo, Vercel revisará si el DNS ya está configurado. Si todavía no lo está, mostrará un aviso parecido a:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "mensaje-vercel",
        code: "Invalid Configuration"
      },
      {
        type: "p",
        text: "o:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "mensaje-vercel",
        code: "DNS Record Required"
      },
      {
        type: "p",
        text:
          "No te preocupes, eso significa que falta agregar el registro DNS en tu proveedor de dominio."
      },

      { type: "h2", text: "3. Obtener el valor CNAME desde Vercel" },
      {
        type: "p",
        text:
          "Después de agregar el dominio en Vercel, la plataforma te mostrará una tabla con los datos que debes configurar en tu DNS."
      },
      {
        type: "p",
        text: "Normalmente se verá parecido a esto:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "tabla-cname",
        code:
          "Type  | Name / Host | Value / Target\n----- | ----------- | ---------------------\nCNAME | subdominio  | cname.vercel-dns.com."
      },
      {
        type: "p",
        text: "El dato más importante es el **Value** o **Target**."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname-value",
        code: "cname.vercel-dns.com."
      },
      {
        type: "p",
        text: "En algunos casos, Vercel puede mostrarte un valor más específico, parecido a este:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname-value",
        code: "67a418ff670ce11d.vercel-dns-017.com."
      },
      {
        type: "p",
        text: "Ese valor debes copiarlo exactamente como aparece."
      },

      { type: "h2", text: "4. Entrar al panel DNS de tu dominio" },
      {
        type: "p",
        text:
          "Ahora debes entrar al proveedor donde administras tu dominio. Puede ser:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "proveedores-dns",
        code:
          "Namecheap\nGoDaddy\nCloudflare\nHostinger\nGoogle Domains\ncPanel\nOtro proveedor DNS"
      },
      {
        type: "p",
        text:
          "En este ejemplo usaremos la lógica general de Namecheap, pero el proceso es muy parecido en otros proveedores."
      },
      {
        type: "p",
        text: "Busca una sección llamada algo similar a:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "secciones-dns",
        code:
          "DNS\nAdvanced DNS\nDNS Records\nZone Editor\nAdministrar DNS\nRegistros DNS"
      },

      { type: "h2", text: "5. Crear el registro CNAME" },
      {
        type: "p",
        text: "Agrega un nuevo registro DNS con estos datos:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-cname",
        code:
          "Campo          | Valor\n-------------- | -------------------------------\nType           | CNAME Record\nHost / Name    | el nombre del subdominio\nValue / Target | el valor que te dio Vercel\nTTL            | Automatic o valor por defecto"
      },

      { type: "h3", text: "Ejemplo práctico" },
      {
        type: "p",
        text: "Supongamos que tu dominio es:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio",
        code: "gabrielgomez.site"
      },
      {
        type: "p",
        text: "Y quieres crear el subdominio:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "subdominio",
        code: "dashboard-metricas"
      },
      {
        type: "p",
        text: "Entonces el dominio final será:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url-final",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "En tu DNS deberías agregar algo así:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-cname",
        code:
          "Type: CNAME Record\nHost: dashboard-metricas\nValue: cname.vercel-dns.com.\nTTL: Automatic"
      },
      {
        type: "p",
        text: "O, si Vercel te dio un valor personalizado:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-cname",
        code:
          "Type: CNAME Record\nHost: dashboard-metricas\nValue: 67a418ff670ce11d.vercel-dns-017.com.\nTTL: Automatic"
      },

      { type: "h2", text: "6. Importante: qué poner en “Host”" },
      {
        type: "p",
        text: "Este punto suele causar confusión."
      },
      {
        type: "p",
        text: "Si el dominio completo será:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-completo",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "En el campo **Host** no debes poner todo el dominio completo."
      },
      {
        type: "p",
        text: "Incorrecto:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "host-incorrecto",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "Correcto:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "host-correcto",
        code: "dashboard-metricas"
      },
      {
        type: "p",
        text:
          "Esto es porque el panel DNS ya sabe que estás editando el dominio principal:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-principal",
        code: "gabrielgomez.site"
      },
      {
        type: "p",
        text: "Por eso solo debes escribir la parte del subdominio."
      },

      { type: "h2", text: "7. Importante: qué poner en “Value”" },
      {
        type: "p",
        text: "El campo **Value** es el destino al que apuntará el subdominio."
      },
      {
        type: "p",
        text: "Ese valor lo obtienes desde Vercel, en:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "ruta-vercel",
        code: "Project → Settings → Domains"
      },
      {
        type: "p",
        text: "Ejemplo común:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname-value",
        code: "cname.vercel-dns.com."
      },
      {
        type: "p",
        text: "Ejemplo personalizado:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname-value",
        code: "67a418ff670ce11d.vercel-dns-017.com."
      },
      {
        type: "p",
        text: "Debes copiarlo tal como aparece en Vercel."
      },
      {
        type: "p",
        text: "Si aparece con punto final, por ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "cname-value",
        code: "cname.vercel-dns.com."
      },
      {
        type: "p",
        text: "puedes dejarlo con el punto final."
      },

      { type: "h2", text: "8. Guardar el registro DNS" },
      {
        type: "p",
        text: "Una vez llenados los campos, guarda el registro."
      },
      {
        type: "p",
        text: "Tu configuración debería quedar parecida a esta:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-final",
        code: "CNAME Record | dashboard-metricas | cname.vercel-dns.com. | Automatic"
      },
      {
        type: "p",
        text: "No borres otros registros existentes como:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registros-existentes",
        code: "www\n@\nmail\nMX\nTXT"
      },
      {
        type: "p",
        text: "Solo agrega el nuevo registro para tu subdominio."
      },

      { type: "h2", text: "9. Verificar el dominio en Vercel" },
      {
        type: "p",
        text: "Después de guardar el registro DNS, regresa a Vercel:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "ruta-vercel",
        code: "Project → Settings → Domains"
      },
      {
        type: "p",
        text: "Busca el dominio que agregaste."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-vercel",
        code: "dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "Vercel intentará verificar la configuración."
      },
      {
        type: "p",
        text: "Si todo está correcto, el dominio aparecerá como configurado correctamente."
      },
      {
        type: "p",
        text:
          "Puede tardar desde unos minutos hasta varias horas, dependiendo de la propagación DNS."
      },

      { type: "h2", text: "10. Probar el subdominio" },
      {
        type: "p",
        text:
          "Cuando Vercel marque el dominio como correcto, abre el subdominio en el navegador."
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url",
        code: "https://dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "En tu caso será:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url",
        code: "https://subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Si todo está bien, deberías ver tu proyecto desplegado en Vercel."
      },

      { type: "h2", text: "11. Verificar desde terminal" },
      {
        type: "p",
        text: "También puedes verificar el registro DNS desde la terminal."
      },

      { type: "h3", text: "En Windows" },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "nslookup -type=CNAME subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "nslookup -type=CNAME dashboard-metricas.gabrielgomez.site"
      },

      { type: "h3", text: "En Linux o Mac" },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "dig CNAME subdominio.tudominio.com +short"
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "bash",
        fileName: "terminal",
        code: "dig CNAME dashboard-metricas.gabrielgomez.site +short"
      },
      {
        type: "p",
        text: "Si responde con algo como:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "respuesta-dns",
        code: "cname.vercel-dns.com."
      },
      {
        type: "p",
        text:
          "o con el valor que te dio Vercel, significa que el DNS ya está apuntando correctamente."
      },

      { type: "h2", text: "12. Errores comunes" },

      { type: "h3", text: "Error 1: Poner el dominio completo en Host" },
      {
        type: "p",
        text: "Incorrecto:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "host-incorrecto",
        code: "Host: dashboard-metricas.gabrielgomez.site"
      },
      {
        type: "p",
        text: "Correcto:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "host-correcto",
        code: "Host: dashboard-metricas"
      },

      { type: "h3", text: "Error 2: Confundir CNAME con NS" },
      {
        type: "p",
        text: "Para conectar un subdominio a Vercel normalmente necesitas un:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro",
        code: "CNAME Record"
      },
      {
        type: "p",
        text: "No necesitas un:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro",
        code: "NS Record"
      },
      {
        type: "p",
        text:
          "El registro **NS** se usa para delegar servidores de nombres, no para apuntar un subdominio normal a Vercel."
      },

      { type: "h3", text: "Error 3: No agregar primero el dominio en Vercel" },
      {
        type: "p",
        text: "Primero agrega el dominio en:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "ruta-vercel",
        code: "Vercel → Project → Settings → Domains"
      },
      {
        type: "p",
        text:
          "Luego copia el valor que Vercel te indique y agrégalo en tu proveedor DNS."
      },

      { type: "h3", text: "Error 4: Borrar registros existentes" },
      {
        type: "p",
        text: "No borres registros como:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registros-existentes",
        code: "www\n@\nMX\nTXT\nmail"
      },
      {
        type: "p",
        text: "A menos que sepas exactamente qué hacen."
      },
      {
        type: "p",
        text: "Para este caso solo necesitas agregar un nuevo registro CNAME."
      },

      { type: "h2", text: "Resumen final" },
      {
        type: "p",
        text: "Para conectar un subdominio a Vercel necesitas hacer esto:"
      },

      { type: "h3", text: "En Vercel" },
      {
        type: "p",
        text: "Agregar el dominio completo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-vercel",
        code: "subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "dominio-vercel",
        code: "dashboard-metricas.gabrielgomez.site"
      },

      { type: "h3", text: "En tu DNS" },
      {
        type: "p",
        text: "Agregar un registro:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-cname",
        code:
          "Type: CNAME Record\nHost: subdominio\nValue: el valor que te dio Vercel\nTTL: Automatic"
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "registro-cname",
        code:
          "Type: CNAME Record\nHost: dashboard-metricas\nValue: cname.vercel-dns.com.\nTTL: Automatic"
      },

      { type: "h2", text: "Resultado final" },
      {
        type: "p",
        text: "Tu proyecto de Vercel quedará disponible desde:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url-final",
        code: "https://subdominio.tudominio.com"
      },
      {
        type: "p",
        text: "Ejemplo:"
      },
      {
        type: "snippet",
        language: "txt",
        fileName: "url-final",
        code: "https://dashboard-metricas.gabrielgomez.site"
      }
    ],
    date: "20 de mayo, 2026",
    image: "/img/tutoriales/vercel-cname-subdominio.webp",
    category: "Tutoriales",
    featuredPosts: true
  },
  {
    name: "Cómo limitar opciones en un Formulario de Google",
    description: [
      {
        type: "p",
        text:
          "A veces, cuando haces un Formulario de Google, no quieres que la gente marque todas las opciones que quiera. Tal vez necesitas que elijan solo una cierta cantidad, que seleccionen mínimo algunas, o que no se pasen de un número específico.",
      },
      {
        type: "p",
        text:
          "Por suerte, Google Forms ya tiene una herramienta para eso y activarla es bastante fácil.",
      },

      { type: "h2", text: "¿Qué tienes que hacer?" },

      { type: "h3", text: "1. Crea una pregunta de tipo **“Casillas de verificación”**" },
      {
        type: "p",
        text:
          "Primero, agrega una pregunta nueva y asegúrate de que sea de tipo **Casillas de verificación**, porque esta opción permite que la persona seleccione varias respuestas.",
      },

      { type: "h3", text: "2. Haz clic en los **tres puntos** de la esquina inferior derecha" },
      {
        type: "p",
        text:
          "Dentro de la misma pregunta, verás el menú de los tres puntos. Ahí están varias opciones extra de configuración.",
      },

      { type: "h3", text: "3. Selecciona **“Validación de respuestas”**" },
      {
        type: "p",
        text:
          "Cuando abras ese menú, da clic en **Validación de respuestas**.",
      },

      { type: "h3", text: "4. Elige la regla que necesitas" },
      {
        type: "p",
        text:
          "Aquí ya podrás decirle al formulario cuántas opciones puede marcar la persona. Puedes definir si quieres que seleccione:",
      },
      { type: "ul", items: ["un mínimo,", "un máximo,", "o una cantidad exacta."] },
      {
        type: "p",
        text:
          "Por ejemplo, si quieres que el usuario elija solo 3 opciones, aquí es donde lo configuras.",
      },

      { type: "h3", text: "5. Personaliza el mensaje de error" },
      {
        type: "p",
        text:
          "También puedes escribir un mensaje para que, si alguien no cumple con la regla, el formulario le diga qué tiene que corregir.",
      },
      { type: "p", text: "Por ejemplo:" },
      {
        type: "ul",
        items: [
          "**Selecciona máximo 3 opciones**",
          "**Debes elegir al menos 2 respuestas**",
          "**Selecciona exactamente 1 opción**",
        ],
      },
      {
        type: "p",
        text:
          "Esto ayuda mucho para que el formulario sea más claro y para que la gente no se confunda al responder.",
      },

      { type: "h2", text: "¿Por qué sirve esto?" },
      {
        type: "p",
        text:
          "Aunque parece un detalle pequeño, realmente ayuda bastante. Hace que tu formulario sea más ordenado, evita errores en las respuestas y te permite recibir justo la información que necesitas.",
      },
      {
        type: "p",
        text:
          "Es una función sencilla, pero muy útil cuando quieres tener más control sobre cómo responden tu formulario.",
      },
    ],
    date: "05 de marzo, 2026",
    image: "/img/tutoriales/forms-validation.png",
    // media: [
    //   {
    //     type: "image",
    //     src: "/img/tutoriales/forms-validation.png",
    //     alt: "Captura principal",
    //     caption: "Vista inicial"
    //   },
    //   {
    //     type: "image",
    //     src: "/img/tutoriales/forms-validation.png",
    //     alt: "Otra captura"
    //   },
    //   {
    //     type: "video",
    //     src: "/videos/demo.mp4",
    //     poster: "/img/tutoriales/poster.png",
    //     caption: "Demo del proceso"
    //   }
    // ],
    category: "Tutoriales",
    featuredPosts: true
  },
  {
    name: "corner-shape: la evolución de border-radius en CSS",
    description: [
      {
        type: "p",
        text:
          "Durante años, el redondeo de esquinas en CSS se resolvió con una sola herramienta: **border-radius**. Funciona muy bien, pero tiene un límite: casi todo termina siendo variaciones de una **elipse**. Si querías un chaflán (corte diagonal), una muesca (*notch*), un recorte cóncavo (*scoop*) o una esquina tipo *squircle* (look moderno de UI), tocaba usar hacks: clip-path, SVG, máscaras, pseudo-elementos… y mantenimiento extra."
      },

      { type: "p", text: "Ahí entra **corner-shape**: una propiedad que separa lo que antes estaba “mezclado” en border-radius y lo vuelve explícito." },

      {
        type: "ul",
        items: [
          "**El tamaño de la esquina** (lo sigues controlando con border-radius).",
          "**La geometría de la esquina** (la defines con corner-shape)."
        ]
      },

      {
        type: "p",
        text:
          "En simple: border-radius define *cuánto* y corner-shape define *cómo*."
      },

      { type: "h2", text: "El modelo mental correcto: “zona” vs “curva”" },

      { type: "h3", text: "1) Primero defines la “zona de esquina”" },
      {
        type: "p",
        text:
          "Esto lo hace border-radius. Delimitas el área donde existirá una esquina especial:"
      },
      { type: "snippet", language: "css", fileName: "card.css", code: ".card { border-radius: 24px; }" },
      {
        type: "p",
        text:
          "Si border-radius es 0, no hay zona. Y si no hay zona, corner-shape no tiene nada que modificar."
      },

      { type: "h3", text: "2) Luego defines la “curva” que llena esa zona" },
      {
        type: "p",
        text:
          "Aquí entra corner-shape: mismo tamaño de zona, distinta forma matemática."
      },
      {
        type: "snippet",
        language: "css",
        fileName: "card.css",
        code: ".card { border-radius: 24px; corner-shape: squircle; }"
      },

      { type: "h2", text: "Aclaración importante: round, no rounded" },
      {
        type: "p",
        text:
          "En ejemplos informales verás corner-shape: rounded, pero el keyword válido es **round** (y es el valor por defecto)."
      },
      { type: "snippet", language: "css", fileName: "valid.css", code: ".btn { border-radius: 14px; corner-shape: round; }" },

      { type: "h2", text: "Sintaxis: 1 a 4 valores (igual que border-radius)" },
      {
        type: "p",
        text:
          "corner-shape admite **1 a 4 valores**, igual que border-radius, para controlar cada esquina:"
      },
      {
        type: "ul",
        items: [
          "1 valor: todas las esquinas.",
          "2 valores: (TL + BR) / (TR + BL).",
          "4 valores: (TL TR BR BL)."
        ]
      },
      {
        type: "snippet",
        language: "css",
        fileName: "panel.css",
        code:
          ".panel {\n  border-radius: 20px;\n  corner-shape: notch round squircle bevel; /* TL TR BR BL */\n}"
      },

      { type: "h2", text: "Valores comunes: qué significa cada uno y cómo se usa" },

      { type: "h3", text: "round — redondeo “clásico”" },
      {
        type: "p",
        text:
          "Es la esquina redondeada estándar (convexa). Útil para UI tradicional, neutral y universal."
      },
      { type: "snippet", language: "css", fileName: "btn.css", code: ".btn { border-radius: 14px; corner-shape: round; }" },

      { type: "h3", text: "squircle — moderno, entre círculo y cuadrado" },
      {
        type: "p",
        text:
          "Curva convexa “más cuadrada” que round, típica de interfaces modernas (cards, botones, inputs)."
      },
      { type: "snippet", language: "css", fileName: "card.css", code: ".card { border-radius: 24px; corner-shape: squircle; }" },

      { type: "h3", text: "square — esquina cuadrada perfecta" },
      {
        type: "p",
        text:
          "Es una esquina de 90°. Útil cuando quieres mezclar formas por esquina o animar de “soft” a “sharp”."
      },
      {
        type: "snippet",
        language: "css",
        fileName: "box.css",
        code: ".box { border-radius: 24px; corner-shape: square; }"
      },

      { type: "h3", text: "bevel — chaflán (corte diagonal)" },
      {
        type: "p",
        text:
          "Es un recorte recto diagonal. El tamaño del chaflán lo marca border-radius: con 8px es sutil; con 24px es evidente."
      },
      { type: "snippet", language: "css", fileName: "tag.css", code: ".tag { border-radius: 16px; corner-shape: bevel; }" },

      { type: "h3", text: "scoop — curva cóncava (hacia adentro)" },
      {
        type: "p",
        text:
          "Es una esquina “mordida” cóncava. Útil para tickets, cupones o tarjetas decorativas."
      },
      { type: "snippet", language: "css", fileName: "ticket.css", code: ".ticket { border-radius: 22px; corner-shape: scoop; }" },

      { type: "h3", text: "notch — muesca cuadrada cóncava" },
      {
        type: "p",
        text:
          "Es una muesca cóncava tipo recorte cuadrado. Da un look industrial/tech (HUD, fichas, tarjetas)."
      },
      { type: "snippet", language: "css", fileName: "hud.css", code: ".hud { border-radius: 18px; corner-shape: notch; }" },

      { type: "h2", text: "superellipse(n): control fino (lo mejor de corner-shape)" },
      {
        type: "p",
        text:
          "Además de keywords, puedes usar corner-shape: superellipse(n);. La intuición del parámetro n:"
      },
      {
        type: "ul",
        items: [
          "0 → bevel (línea recta).",
          "1 → round (redondeo estándar).",
          "2 → squircle.",
          "valores grandes → se acercan a square.",
          "valores negativos → formas cóncavas (scoop/notch)."
        ]
      },

      { type: "h3", text: "Ejemplos útiles" },
      {
        type: "snippet",
        language: "css",
        fileName: "examples.css",
        code:
          "/* Más “cuadrada” que squircle, pero aún suave */\n.icon { border-radius: 28px; corner-shape: superellipse(3); }\n\n/* Casi cuadrada, con transición suave */\n.panel { border-radius: 26px; corner-shape: superellipse(5); }\n\n/* Intermedio entre bevel y round: redondeo más “tenso” */\n.chip { border-radius: 14px; corner-shape: superellipse(0.5); }"
      },

      { type: "h2", text: "Uso real en proyectos: mejora progresiva" },
      {
        type: "p",
        text:
          "Como corner-shape puede tener soporte variable, el patrón recomendado es usarlo como **mejora progresiva**: primero defines un UI correcto con border-radius y luego activas corner-shape solo si el navegador lo soporta."
      },
      { type: "h3", text: "1) Fallback universal" },
      { type: "snippet", language: "css", fileName: "fallback.css", code: ".card { border-radius: 24px; }" },

      { type: "h3", text: "2) Mejora condicional con @supports" },
      {
        type: "snippet",
        language: "css",
        fileName: "progressive.css",
        code:
          "@supports (corner-shape: squircle) {\n  .card { corner-shape: squircle; }\n}"
      },
      {
        type: "p",
        text:
          "Con esto, en navegadores sin soporte todo se ve normal (solo border-radius), y en compatibles obtienes el extra visual sin romper nada."
      },

      { type: "h2", text: "Bonus: también afecta borde, sombras y recortes" },
      {
        type: "p",
        text:
          "Una ventaja práctica es que la forma de esquina impacta el recorte del fondo y se alinea con cómo se perciben bordes, outlines y sombras del elemento."
      },

      { type: "h2", text: "Conclusión" },
      {
        type: "p",
        text:
          "corner-shape no reemplaza border-radius; lo complementa. Sigues controlando el tamaño como siempre, pero ahora tienes una paleta geométrica mucho más rica: desde *squircles* modernos, chaflanes y recortes cóncavos, hasta muescas industriales. Resultado: CSS más declarativo y menos hacks."
      },

      { type: "h2", text: "Anexo: generador CSS para explorar corner-shape" },
      {
        type: "p",
        text:
          "Si quieres probar rápidamente distintos valores y copiar el CSS listo, aquí tienes un generador/preview que facilita la **exploración inicial** y la **implementación** en tus componentes:"
      },
      {
        type: "link",
        href: "/herramientas/corner-shape-generador",
        text: "Abrir generador/preview de corner-shape"
      },

      {
        type: "p",
        parts: [
          { type: "text", text: "Consulta el extenso " },
          {
            type: "link",
            href: "https://frontendmasters.com/blog/understanding-css-corner-shape-and-the-power-of-the-superellipse/",
            text: "artículo de Amit Sheen en Frontend Masters",
          },
          { type: "text", text: " para obtener una excelente descripción general de la función y cómo funciona:" },
        ],
      }
    ],
    date: "26 de febrero, 2026",
    image: "/img/tutoriales/corner-shape-evolucion.png",
    category: "Frontend",
    featuredPosts: true
  },
  {
    "name": "Instalar Office LTSC 2024 con Office Deployment Tool (ODT)",
    "description": [
      {
        "type": "p",
        "text": "En este tutorial instalaremos **Office LTSC 2024** usando la herramienta oficial de Microsoft llamada **Office Deployment Tool (ODT)**. El flujo es: descargar ODT, extraer `setup.exe`, crear `configuration.xml` y ejecutar la instalación desde CMD como administrador."
      },

      { "type": "h2", "text": "1) Descargar Office Deployment Tool (ODT)" },
      {
        "type": "p",
        "text": "Descarga la herramienta desde el **Centro de descarga de Microsoft**. No importa que la página esté en inglés; el botón **Download** funciona igual."
      },
      {
        "type": "link",
        "text": "Abrir descarga oficial de ODT (Microsoft)",
        "href": "https://www.microsoft.com/en-us/download/details.aspx?id=49117"
      },
      {
        "type": "snippet",
        "language": "text",
        "fileName": "Link oficial (ODT)",
        "code": "https://www.microsoft.com/en-us/download/details.aspx?id=49117"
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/01-odt-download-page.png",
        "alt": "Página oficial de descarga de Office Deployment Tool",
        "caption": "Centro de descarga de Microsoft: botón Download."
      },

      { "type": "h2", "text": "2) Crear carpeta en el Escritorio y mover el instalador" },
      {
        "type": "p",
        "text": "Guarda el archivo descargado en el **Escritorio**. Ahí mismo crea una carpeta (por ejemplo: **Office**). Mueve el instalador dentro de esa carpeta para mantener todo ordenado y facilitar el proceso."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/02-folder-on-desktop.png",
        "alt": "Carpeta Office creada en el Escritorio",
        "caption": "Crea una carpeta en el Escritorio y coloca dentro el instalador descargado."
      },

      { "type": "h2", "text": "3) Extraer archivos de ODT (setup.exe)" },
      {
        "type": "p",
        "text": "Dentro de la carpeta, da clic derecho al instalador descargado y selecciona **“Ejecutar como administrador”**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/03-run-as-admin.png",
        "alt": "Ejecutar como administrador el instalador de ODT",
        "caption": "Clic derecho → Ejecutar como administrador."
      },
      {
        "type": "p",
        "text": "Aparecerá el aviso: **“¿Quieres permitir que esta aplicación haga cambios en el dispositivo?”**. Selecciona **Sí**."
      },
      {
        "type": "p",
        "text": "Se abrirá el asistente: acepta los términos y condiciones y da clic en **Continuar**. Luego te pedirá elegir carpeta de extracción: ve a **Escritorio** → selecciona tu carpeta (**Office**) → **Aceptar**."
      },
      {
        "type": "p",
        "text": "Al finalizar verás el mensaje **“Files extracted successfully.”**. Da clic en **Aceptar**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/files-extracted-successfully.png",
        "alt": "Mensaje Files extracted successfully",
        "caption": "Extracción completada correctamente."
      },
      {
        "type": "p",
        "text": "En la carpeta quedará `setup.exe` y también un XML de ejemplo como `configuration-Office365-x64.xml`. **Borra** el XML de ejemplo para evitar confusiones y **no toques** `setup.exe` por el momento."
      },

      { "type": "h2", "text": "4) Confirmar la arquitectura (64 bits / 32 bits)" },
      {
        "type": "p",
        "text": "Para confirmar la arquitectura, abre el buscador (la lupita) y escribe **“Acerca de tu PC”**. En Configuración busca **Tipo de sistema**. Normalmente será **64 bits**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/about-your-pc-architecture.png",
        "alt": "Pantalla Acerca de tu PC mostrando Tipo de sistema",
        "caption": "Verifica si tu sistema es de 64 bits o 32 bits."
      },

      { "type": "h2", "text": "5) Crear configuration.xml en config.office.com" },
      {
        "type": "p",
        "text": "Si solo quieres una configuración **predeterminada** para **64 bits** en **Español (México)** (Access, Word, Excel, PowerPoint y OneNote), puedes **omitir este paso**. Descarga el archivo aquí:",
      },
      {
        type: "downloadLink",
        text: "Descargar configuration.xml (64 bits · Español México)",
        href: "/material/office-ltsc/configuration.xml",
        fileName: "configuration.xml"
      },
      {
        "type": "p",
        "text": "Después, continúa directamente con el **Paso 6) Instalar Office LTSC desde CMD (Administrador)**."
      },
      {
        "type": "p",
        "text": "Ahora crea el archivo `configuration.xml` desde la herramienta de configuración en línea. Ahí seleccionarás la **arquitectura**, los **productos LTSC**, las **aplicaciones** y el **idioma**."
      },
      {
        "type": "link",
        "text": "Abrir Office Customization Tool (config.office.com)",
        "href": "https://config.office.com/deploymentsettings"
      },
      {
        "type": "snippet",
        "language": "text",
        "fileName": "Office Customization Tool",
        "code": "https://config.office.com/deploymentsettings"
      },

      { "type": "h3", "text": "Arquitectura" },
      {
        "type": "p",
        "text": "En **¿Qué arquitectura quiere implementar?** elige la que corresponda a tu equipo (por lo general **64 bits**)."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/architecture.png",
        "alt": "Sección Arquitectura en Office Customization Tool",
        "caption": "Selecciona 64-bit o 32-bit según tu equipo."
      },

      { "type": "h3", "text": "Productos" },
      {
        "type": "p",
        "text": "En **Conjuntos de aplicaciones de Office**, selecciona: **Office LTSC Professional Plus 2024 - Volume License**. Si ocupas Visio o Project, puedes agregarlos; si no, déjalos sin seleccionar."
      },
      {
        "type": "p",
        "text": "Opcionales:\n• Visio LTSC Professional 2024 - Volume License\n• Project Professional 2024 - Volume License"
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/products.png",
        "alt": "Selección de productos Office LTSC 2024 en Office Customization Tool",
        "caption": "Selecciona Office LTSC 2024 (y opcionalmente Visio/Project)."
      },

      { "type": "h3", "text": "Aplicaciones" },
      {
        "type": "p",
        "text": "Baja a Aplicaciones y marca únicamente las que necesites (Word, Excel, PowerPoint, etc.). Al terminar da clic en siguiente."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/apps.png",
        "alt": "Selección de aplicaciones de Office",
        "caption": "Elige solo las apps necesarias."
      },

      { "type": "h3", "text": "Idioma" },
      {
        "type": "p",
        "text": "En **Seleccione el idioma principal**, elige **Español (México)**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/language.png",
        "alt": "Selección de idioma Español (México) en Office Customization Tool",
        "caption": "Idioma principal: Español (México)."
      },
      {
        "type": "p",
        "text": "A partir de este punto, puedes dejar la configuración **tal como está por defecto**. Solo da clic en **Siguiente** en cada pantalla hasta que el asistente cambie a **Finalizar**."
      },

      { "type": "h3", "text": "Exportar configuration.xml" },
      {
        "type": "p",
        "text": "Da clic en **Exportar**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/export.png",
        "alt": "Pantalla de exportación en Office Customization Tool",
        "caption": "Exportar configuración."
      },

      {
        "type": "p",
        "text": "Se abrirá un recuadro donde debes elegir **Formato Office Open XML** y luego dar clic en **Aceptar**."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/format.png",
        "alt": "Recuadro de exportación en Office Customization Tool",
        "caption": "Selecciona Formato Office Open XML y confirma con Aceptar."
      },
      {
        "type": "p",
        "text": "Acepta los términos del contrato de licencia. En **Nombre de archivo**, escribe **configuration** (para que quede `configuration.xml`), da clic en **Exportar** y guarda el archivo dentro de la carpeta **Office** del Escritorio (junto a `setup.exe`)."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/save-configuration-xml.png",
        "alt": "Guardar configuration.xml en la carpeta del Escritorio",
        "caption": "Guarda configuration.xml junto a setup.exe."
      },

      { "type": "h2", "text": "6) Instalar Office LTSC desde CMD (Administrador)" },
      {
        "type": "p",
        "text": "Abre el buscador, escribe **cmd** y selecciona **Ejecutar como administrador**. Acepta el aviso de permisos (Sí)."
      },
      {
        "type": "image",
        "src": "/img/tutoriales/office-ltsc/cmd-admin.png",
        "alt": "CMD ejecutado como administrador",
        "caption": "CMD en modo administrador."
      },
      {
        "type": "p",
        "text": "Abre tu carpeta **Office** en el Explorador. Da clic en la barra de ruta para ver la ruta completa, selecciónala y cópiala."
      },
      {
        "type": "p",
        "text": "En CMD entra a la carpeta pegando la ruta con `cd` (usa comillas)."
      },
      {
        "type": "snippet",
        "language": "cmd",
        "fileName": "Entrar a la carpeta",
        "code": "cd /\"RUTA_COMPLETA_DE_TU_CARPETA\""
      },
      {
        "type": "p",
        "text": "Ejecuta la instalación usando tu archivo `configuration.xml`:"
      },
      {
        "type": "snippet",
        "language": "cmd",
        "fileName": "Instalación",
        "code": "setup.exe /configure configuration.xml"
      },
      {
        "type": "p",
        "text": "Al ejecutar el comando, iniciará la instalación. Solo queda esperar a que termine."
      },

      { "type": "h2", "text": "7) Finalizar y comprobar" },
      {
        "type": "p",
        "text": "Cuando termine, abre Word o Excel para confirmar que Office quedó instalado correctamente."
      },

      { "type": "h3", "text": "Recursos (opcional)" },
      {
        "type": "p",
        "text": "Si quieres una guía oficial de despliegue para Office LTSC 2024 (referencia técnica), puedes consultar:"
      },
      {
        "type": "link",
        "text": "Guía oficial: Deploy Office LTSC 2024 (Microsoft Learn)",
        "href": "https://learn.microsoft.com/en-us/office/ltsc/2024/deploy"
      }
    ],
    "date": "17 de diciembre, 2025",
    "image": "/img/tutoriales/office-ltsc/cover-office-ltsc.jpg",
    "category": "Tutoriales",
    "featuredPosts": true
  },
  {
    name: "Font-size clamp() explicado: fórmula base, pendiente e intercepto",
    description: [
      { type: "p", text: "Este artículo explica la fórmula matemática detrás del **FontClampGenerator** y el significado real de los valores que aparecen como **Pendiente** e **Intercepto**. La meta es generar una regla CSS de tipografía fluida usando `clamp(min, preferido, max)` de forma correcta y predecible." },
      { type: "p", text: "La idea central es simple: queremos que el tamaño de fuente crezca de forma lineal desde un valor mínimo hasta uno máximo, dentro de un rango de anchuras de viewport." },
      { type: "p", text: "Definimos dos puntos en una gráfica donde:\n• **Punto 1:** ancho mínimo del viewport = `minVW` y tamaño mínimo de fuente = `minFS`.\n• **Punto 2:** ancho máximo del viewport = `maxVW` y tamaño máximo de fuente = `maxFS`." },
      { type: "p", text: "Con esos dos puntos construimos una recta. En CSS, esa recta la expresamos como una forma compatible con unidades responsivas:\n`font-size: clamp(minFS, calc(intercepto + pendiente * vw), maxFS)`." },
      { type: "p", text: "El **valor preferido** es la parte fluida. Es decir, el bloque que cambia en función del ancho de la pantalla:\n`calc(InterceptoPx + PendienteVw)`." },
      { type: "p", text: "La fórmula que usa el generador es la estándar para convertir una recta definida en píxeles a un término en `vw`:" },
      {
        type: "snippet", language: "js", fileName: "formula.js", code: `// Datos de entrada en px
          // minVW, maxVW, minFS, maxFS

          // 1) Pendiente (coeficiente de vw)
          const slope = ((maxFS - minFS) / (maxVW - minVW)) * 100;

          // 2) Intercepto (término constante en px)
          const intercept = minFS - (slope * minVW) / 100;

          // 3) Expresión CSS final
          const preferred = \`calc(\${intercept}px + \${slope}vw)\`;
          const clamp = \`clamp(\${minFS}px, \${preferred}, \${maxFS}px)\`;` },
      { type: "p", text: "**¿Por qué multiplicamos por 100?**\nPorque `1vw` representa el **1%** del ancho del viewport. Para que la recta pase exactamente por los dos puntos (minVW/minFS y maxVW/maxFS), convertimos la pendiente de “px por px” a “px por vw”." },
      { type: "p", text: "En otras palabras, esta relación asegura que:\n• Cuando el viewport mide **minVW**, el cálculo devuelve **minFS**.\n• Cuando el viewport mide **maxVW**, el cálculo devuelve **maxFS**." },
      { type: "h2", text: "¿Qué significa **Pendiente**?" },
      { type: "p", text: "En el generador, la **Pendiente** es el número que acompaña al `vw` dentro del `calc()`.\nEjemplo conceptual:\n`calc(10px + 1.25vw)` → aquí **1.25** es la pendiente." },

      { type: "p", text: "Interpretación práctica:\n• Una pendiente más alta significa que el texto crece más rápido conforme aumenta el ancho del viewport.\n• Una pendiente más baja produce un crecimiento más suave." },
      { type: "p", text: "Por eso en el panel de resultados verás algo como:\n**Pendiente: xx.xx**\nEse valor es el coeficiente real que alimenta la parte `+ xx.xxvw`." },
      { type: "h3", text: "¿Qué significa **Intercepto**?" },
      { type: "p", text: "El **Intercepto** es el valor fijo en píxeles que se suma a la parte responsiva.\nEjemplo conceptual:\n`calc(10px + 1.25vw)` → aquí **10px** es el intercepto." },

      { type: "p", text: "Interpretación práctica:\n• Ajusta el punto de partida de la recta.\n• Permite que la fórmula siga siendo exacta en el ancho mínimo definido." },
      { type: "p", text: "En el panel del generador normalmente lo verás así:\n**Intercepto: xxx.xxx px**\nEste valor alimenta el bloque `calc(InterceptoPx + PendienteVw)`." },
      { type: "h3", text: "Resumen de la regla final" },
      { type: "p", text: "El generador produce esta estructura:\n`font-size: clamp(minFSpx, calc(interceptoPx + pendienteVw), maxFSpx);`" },
      { type: "p", text: "Con esto consigues una tipografía que:\n• Nunca baja de **minFS**.\n• Escala de forma fluida entre anchos mínimos y máximos.\n• Nunca supera **maxFS**." },
    ],
    date: "9 de diciembre, 2025",
    image: "/img/tutoriales/css-clamp-tipografia.jpg",
    category: "Frontend",
    featuredPosts: false
  },
  {
    name: "CSS clamp(): tipografía fluida sin dramas",
    description: [
      { "type": "p", "text": "`clamp()` es uno de los recursos modernos más útiles de CSS. Con una sola línea obtienes texto fluido, legible y controlado en todo rango de pantallas." },

      { "type": "p", "text": "Esta línea dice: “nunca seas más chico que **1.9rem**, intenta ser **3vw** (fluido) y nunca pases de **2.4rem**”." },
      { "type": "snippet", "language": "css", "fileName": "styles.css", "code": "font-size: clamp(1.9rem, 3vw, 2.4rem);" },

      { "type": "h2", "text": "¿Qué es `clamp()`?" },
      { "type": "snippet", "language": "css", "fileName": "Sintaxis", "code": "clamp(MIN, IDEAL, MAX)" },
      { "type": "snippet", "language": "text", "fileName": "Idea", "code": "clamp(a, b, c) = min( max(b, a), c )" },
      { "type": "p", "text": "Traducción: se toma el valor **IDEAL**; si es menor que **MIN**, usa **MIN**; si es mayor que **MAX**, usa **MAX**. Solo acota el valor a un rango lógico." },

      { "type": "h3", "text": "Desglose del ejemplo" },
      { "type": "p", "text": "• **Mínimo:** 1.9rem → garantiza legibilidad.\n• **Fluido:** 3vw → escala con el ancho de pantalla.\n• **Máximo:** 2.4rem → evita tamaños desproporcionados en monitores grandes." },

      { "type": "h3", "text": "¿Cuándo cambia cada tramo?" },
      { "type": "p", "text": "Asumiendo 1rem = 16px: 1.9rem ≈ 30.4px y 2.4rem ≈ 38.4px.\n• Por debajo de ~1013px de ancho, 3vw es menor al mínimo → **1.9rem**.\n• Entre ~1013px y ~1280px, el tamaño fluye con **3vw**.\n• Por encima de ~1280px, se fija en **2.4rem**." },

      { "type": "h3", "text": "Ventajas" },
      { "type": "p", "text": "Reduce media queries, mantiene accesibilidad y ofrece una escala tipográfica predecible entre móvil y desktop." },

      { "type": "h2", "text": "Antes vs. ahora" },
      { "type": "snippet", "language": "css", "fileName": "antes.css", "code": "h2 { font-size: 1.9rem; }\n@media (min-width: 1000px) { h2 { font-size: 3vw; } }\n@media (min-width: 1280px) { h2 { font-size: 2.4rem; } }" },
      { "type": "snippet", "language": "css", "fileName": "ahora.css", "code": "h2 { font-size: clamp(1.9rem, 3vw, 2.4rem); }" },

      { "type": "h3", "text": "Buenas prácticas" },
      { "type": "p", "text": "• Define **MIN y MAX en rem** (accesibilidad).\n• Usa **vw/vh** en el valor central para fluidez.\n• Elige conscientemente: **mínimo legible**, **ideal que escala**, **máximo cómodo**." },

      { "type": "h3", "text": "Recetas listas" },
      { "type": "snippet", "language": "css", "fileName": "patterns.css", "code": "/* Título hero */\n.heroTitle { font-size: clamp(2rem, 6vw, 4rem); }\n\n/* Subtítulo */\n.subTitle { font-size: clamp(1.25rem, 3.5vw, 2rem); }\n\n/* Párrafo base */\n.bodyText { font-size: clamp(1rem, 2.2vw, 1.125rem); }" },

    ],
    date: "13 de noviembre, 2025",
    image: "/img/tutoriales/css-clamp-tipografia.jpg",
    category: "Frontend",
    featuredPosts: true
  },
  {
    name: "Docker: limpieza rápida y segura (guía práctica con variantes)",
    description: [
      { "type": "p", "text": "Guía directa para liberar espacio y eliminar artefactos obsoletos en Docker. Incluye niveles de limpieza (segura, total, con volúmenes), filtros para no borrar recursos críticos y manejo de logs gigantes." },

      { "type": "p", "text": "1) Ver cuánto ocupa (opcional)" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "docker system df -v" },

      { "type": "p", "text": "2) Limpieza segura (quita lo obvio)\nElimina contenedores detenidos, redes huérfanas, imágenes dangling y caché de build no referenciada:" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Contenedores detenidos\ndocker container prune\n\n# Redes no usadas (no conectadas a contenedores)\ndocker network prune\n\n# Imágenes \"dangling\" (sin tag o sin usar)\ndocker image prune\n\n# Caché de build “clásica”\ndocker builder prune" },

      { "type": "p", "text": "3) Limpieza “todo lo no usado” (recomendada)\nBorra TODO lo que NO está en uso por algo en ejecución: contenedores detenidos, imágenes no referenciadas, redes sin usar y caché:" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Resumen en un comando\ndocker system prune -a\n# (te pedirá confirmación; añade -f para no preguntar)" },
      { "type": "p", "text": "Nota: `-a` borra todas las imágenes que no estén usadas por NINGÚN contenedor (en ejecución o detenido). Si sólo quieres dangling, omite `-a`." },

      { "type": "p", "text": "4) Incluir volúmenes (agresivo: puede borrar datos)\nSi también quieres eliminar volúmenes no usados (¡pierdes datos persistentes!):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Volúmenes no referenciados por contenedores\ndocker volume prune\n\n# Todo en uno, incluidos volúmenes (super agresivo)\ndocker system prune -a --volumes" },

      { "type": "p", "text": "7) Evitar borrar cosas críticas (filtros útiles)\nPuedes excluir por etiqueta cuando hagas prune masivo:" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# No borres recursos con label keep=true\ndocker system prune -a --filter \"label!=keep\"\n\n# Ejemplo al crear recursos que quieras preservar:\ndocker run -d --label keep=true --name mi_db postgres:16" },

      { "type": "p", "text": "8) Logs gigantes (si te falta espacio)\nLos logs JSON de contenedores pueden crecer mucho. Rotación rápida (no toca volúmenes):" },
      { "type": "snippet", "language": "bash", "fileName": "Linux", "code": "# Truncar logs actuales (Linux)\nsudo find /var/lib/docker/containers -name \"*-json.log\" -exec sh -c '> \"{}\"' \\;" },
      { "type": "snippet", "language": "json", "fileName": "/etc/docker/daemon.json", "code": "{\n  \"log-driver\": \"json-file\",\n  \"log-opts\": { \"max-size\": \"10m\", \"max-file\": \"3\" }\n}" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Reinicia Docker tras editar daemon.json\nsudo systemctl restart docker" },

      { "type": "p", "text": "Limpieza estándar (recomendada, segura)" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "docker system df -v\ndocker system prune -a\ndocker builder prune" },

      { "type": "p", "text": "Sugerencias para el día a día" },
      { "type": "p", "text": "• Pon etiquetas `keep=true` a lo que no quieras que se borre.\n• Define rotación de logs en `daemon.json`.\n• Programa limpiezas con `--filter \"until=...\"` para no tocar lo reciente.\n• Antes de `--volumes`, respalda lo importante (bases de datos, uploads)." }
    ],
    date: "27 de octubre, 2025",
    image: "/img/tutoriales/docker.svg",
    category: "DevOps",
    featuredPosts: true
  },
  {
    name: "Limpieza en Docker: por qué, cuándo y cómo (variantes seguras)",
    description: [
      { "type": "p", "text": "Mantener Docker limpio es clave para **recuperar espacio**, **evitar conflictos de puertos/huérfanos**, **acelerar builds** y **mejorar la seguridad** (imágenes obsoletas con vulnerabilidades). Aquí tienes un playbook con niveles de limpieza —de suave a quirúrgico— y comandos explicados. Funciona en Linux/macOS/WSL/PowerShell (prefiere `docker` CLI moderno y `docker compose`)." },

      { "type": "p", "text": "Revisa tu consumo antes de borrar (diagnóstico):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "docker system df -v   # Uso detallado de imágenes, contenedores, volúmenes y cachés\n" },

      { "type": "p", "text": "Nivel 1 — Limpieza ligera (segura, no toca volúmenes):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Contenedores detenidos\ndocker container prune    # confirma interactivo\n# Imágenes 'dangling' (<none>)\ndocker image prune\n# Redes sin uso (no touches 'bridge', 'host', 'none' si están en uso)\ndocker network prune\n# (Opcional) Caché de build heredado\ndocker builder prune" },
      { "type": "p", "text": "¿Por qué? Elimina artefactos huérfanos típicos del ciclo dev (contenedores que ya no corren, capas temporales de builds). No borra datos persistentes." },

      { "type": "p", "text": "Nivel 2 — Limpieza media (más agresiva, aún sin volúmenes):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Todo lo que no esté en uso por al menos un contenedor en ejecución\ndocker system prune -a   # -a elimina imágenes no usadas por NINGÚN contenedor\n# Builder cache (BuildKit) incluyendo stages intermedios\ndocker builder prune -a  # borra caché de compilación\n" },
      { "type": "p", "text": "¿Cuándo? Tras muchas iteraciones de builds/tags. Mejora mucho el espacio y fuerza builds frescos. **No borra volúmenes** (datos persistentes siguen intactos)." },

      { "type": "p", "text": "Nivel 3 — Limpieza con volúmenes (⚠️ BORRA DATOS):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Incluye volúmenes no referenciados (datos persistentes)\ndocker system prune -a --volumes\n# O solo volúmenes 'dangling'\ndocker volume prune\n" },
      { "type": "p", "text": "¿Cuándo? Ambientes desechables (CI, entornos efímeros) o cuando estás seguro de no necesitar los datos (p.ej., caches, DBs de prueba). **Haz backup** antes si hay dudas." },

      { "type": "p", "text": "Limpieza quirúrgica por proyecto (evita dañar otros stacks):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Etiqueta tus recursos al crear (ejemplo de build/compose):\n# docker build --label project=plan-hidrico -t app:dev .\n# En docker-compose.yml usa 'labels:' en servicios/volúmenes\n\n# Borra solo artefactos con cierta etiqueta\ndocker image prune -a --filter \"label=project=plan-hidrico\"\ndocker container prune   --filter \"label=project=plan-hidrico\"\ndocker volume prune      --filter \"label=project=plan-hidrico\"\ndocker network prune     --filter \"label=project=plan-hidrico\"" },
      { "type": "p", "text": "¿Por qué? En hosts multi-proyecto compartidos evitarás tocar recursos de otros equipos." },

      { "type": "p", "text": "Con Docker Compose (proyectos específicos):" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Apaga y elimina contenedores/REDES del proyecto actual (en la carpeta del compose)\ndocker compose down\n# + Volúmenes declarados en el compose (⚠️ datos)\ndocker compose down -v\n# + Contenedores huérfanos de corridas previas\ndocker compose down --remove-orphans\n# Remueve servicios detenidos del proyecto (sin derribar todo)\ndocker compose rm -f" },
      { "type": "p", "text": "Utiliza esto para limpiar por proyecto sin afectar otros stacks que corren en el mismo host." },

      { "type": "p", "text": "🔐 Seguridad y mantenibilidad: ¿por qué es necesario limpiar?" },
      { "type": "p", "text": "• **Espacio y rendimiento**: capas y cachés antiguos consumen GBs y ralentizan builds.\n• **Reproducibilidad**: eliminar imágenes obsoletas evita que se usen bases vulnerables por accidente.\n• **Menos ruido**: redes/volúmenes/containers huérfanos dificultan el soporte y el monitoreo.\n• **CICD saludable**: runners con disco lleno fallan; limpieza automática evita pipelines rotas." },

      { "type": "p", "text": "🧠 Patrones recomendados (dev/CI/producción):" },
      { "type": "p", "text": "• **Dev**: `docker system prune` semanal; mensual `-a`; evita `--volumes` salvo que sean datos de prueba.\n• **CI**: al final de cada job: `docker system prune -af`; y `docker builder prune -af` para caches.\n• **Prod**: limpieza quirúrgica por etiqueta/proyecto; nunca borres volúmenes de DB sin backup/verificación." },

      { "type": "p", "text": "🧾 Trucos útiles:" },
      { "type": "snippet", "language": "bash", "fileName": "terminal", "code": "# Listar solo lo 'dangling' antes de borrar (simula un dry-run)\ndocker images -f dangling=true\ndocker volume ls -f dangling=true\n\n# Borrar contenedores detenidos específicos (por filtro)\ndocker ps -a --filter status=exited\n# Ejemplo: remover todos los 'exited'\ndocker rm $(docker ps -aq -f status=exited)\n\n# Borrar imágenes sin etiquetas (none)\ndocker rmi $(docker images -q -f dangling=true)\n\n# Caché BuildKit por antigüedad\ndocker builder prune --filter until=168h   # > 7 días\n\n# Limitar logs en producción (daemon.json)\n# /etc/docker/daemon.json\n{\n  \"log-driver\": \"json-file\",\n  \"log-opts\": { \"max-size\": \"10m\", \"max-file\": \"3\" }\n}\n# Reinicia el daemon tras editar\ nsudo systemctl restart docker" },

      { "type": "p", "text": "Riesgos y cómo mitigarlos:" },
      { "type": "p", "text": "• **Pérdida de datos**: `-v/--volumes` borra volúmenes; confirma que son caches/DBs de prueba. Usa backups.\n• **Servicios en producción**: valida que el recurso no está en uso (`docker ps`, `docker volume inspect`).\n• **Dependencias ocultas**: usa **labels** por proyecto y `docker compose down` para aislar el alcance." },

      { "type": "p", "text": "Resumen operativo:" },
      { "type": "p", "text": "1) Diagnostica: `docker system df -v`.\n2) Limpieza ligera: `docker container/image/network prune`.\n3) Limpieza media: `docker system prune -a` + `docker builder prune -a`.\n4) Con datos: `docker system prune -a --volumes` (solo si es seguro).\n5) Por proyecto: etiquetas + `docker compose down(-v)` y filtros `--filter label=...`." }
    ],
    date: "27 de octubre, 2025",
    image: "/img/tutoriales/docker.svg",
    category: "DevOps",
    featuredPosts: true
  },
  {
    name: "ImageMagick en Windows: convertir JPG/JPEG/PNG → WebP sin metadatos",
    description: [
      { "type": "p", "text": "Guía práctica para instalar ImageMagick en **Windows** y convertir masivamente imágenes a **WebP** desde la terminal (PowerShell/CMD), con comandos separados para **.jpg**, **.jpeg** y **.png**, sin metadatos (EXIF/ICC/comentarios), y evitando colisiones de nombres." },

      { "type": "p", "text": "1) Instalar ImageMagick en Windows" },
      { "type": "p", "text": "• Descarga el instalador oficial: https://imagemagick.org/script/download.php (elige la versión **Q16 x64 static**). Durante la instalación:" },
      { "type": "p", "text": "  - Marca **Add application directory to your system path** (para ejecutar `magick` desde cualquier carpeta)." },
      { "type": "p", "text": "  - (Opcional) Marca **Install legacy utilities (e.g., convert)** si las necesitas; no es obligatorio para usar `magick`." },
      { "type": "p", "text": "• Verifica en PowerShell:" },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell", "code": "magick -version" },
      { "type": "p", "text": "Deberías ver la versión y la lista de “Delegates” que incluyen **webp**." },

      { "type": "p", "text": "2) Convertir desde la terminal (en la carpeta con tus imágenes)" },
      { "type": "p", "text": "Comandos separados por extensión; todos **eliminan metadatos** con `-strip` y usan compresión eficiente." },

      { "type": "p", "text": "— Sólo **JPG** (.jpg):" },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell (JPG → WebP)", "code": "magick mogrify -format webp -quality 85 -strip -define webp:method=6 -define webp:near-lossless=0 *.jpg" },

      { "type": "p", "text": "— Sólo **JPEG** (.jpeg):" },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell (JPEG → WebP)", "code": "magick mogrify -format webp -quality 85 -strip -define webp:method=6 -define webp:near-lossless=0 *.jpeg" },

      { "type": "p", "text": "— Sólo **PNG** (mantiene transparencia). Aquí conviene **lossless** o subir calidad si prefieres con pérdidas suaves:" },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell (PNG → WebP lossless)", "code": "magick mogrify -format webp -strip -define webp:method=6 -define webp:lossless=true *.png" },
      { "type": "snippet", "language": "powershell", "fileName": "Alternativa (PNG → WebP con pérdidas suaves)", "code": "magick mogrify -format webp -quality 90 -strip -define webp:method=6 -define webp:near-lossless=0 *.png" },

      { "type": "p", "text": "3) Guardar los WebP en **otra carpeta** (no sobrescribir originales)" },
      { "type": "p", "text": "Crea una carpeta de salida (por ejemplo `webp`) y usa `-path` con `mogrify`:" },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell", "code": "mkdir webp -Force\n# JPG → webp/\nmagick mogrify -path webp -format webp -quality 85 -strip -define webp:method=6 -define webp:near-lossless=0 *.jpg\n# JPEG → webp/\nmagick mogrify -path webp -format webp -quality 85 -strip -define webp:method=6 -define webp:near-lossless=0 *.jpeg\n# PNG → webp/ (lossless recomendado)\nmagick mogrify -path webp -format webp -strip -define webp:method=6 -define webp:lossless=true *.png" },

      { "type": "p", "text": "4) Usar **CMD desde PowerShell** (dos bucles) para evitar colisiones si tienes `1.jpg` y `1.jpeg`" },
      { "type": "p", "text": "Si prefieres usar **.jpg** junto con **.jpeg** y evitar el problema comentado usa `for` de CMD, llama a `cmd /c` y haz dos bucles (uno por extensión). Esto genera nombres únicos: `*_jpg.webp` y `*_jpeg.webp`." },
      { "type": "snippet", "language": "powershell", "fileName": "PowerShell + CMD (dos bucles)", "code": "mkdir webp -Force\ncmd /c 'for %f in (*.jpg *.JPG) do magick \"%f\" -strip -quality 85 -define webp:method=6 -define webp:near-lossless=0 \"webp\\%~nf_jpg.webp\"'\ncmd /c 'for %f in (*.jpeg *.JPEG) do magick \"%f\" -strip -quality 85 -define webp:method=6 -define webp:near-lossless=0 \"webp\\%~nf_jpeg.webp\"'" },

      { "type": "p", "text": "Notas rápidas" },
      { "type": "p", "text": "• `-strip` elimina EXIF/ICC/comentarios → privacidad y menor peso.\n• `-quality 85` (con `webp:method=6`) suele dar excelente fidelidad para fotos. Ajusta 80–90 según tu criterio.\n• Para PNG con transparencia, `-define webp:lossless=true` evita halos y es ideal para logos/íconos.\n• Si usas `mogrify -path`, no puedes personalizar el nombre de salida; si necesitas sufijos (p. ej., `_jpg/_jpeg`) usa el enfoque de **dos bucles** con `cmd /c` mostrado arriba." }
    ],
    date: "17 de octubre, 2025",
    image: "/img/tutoriales/imagemagick-windows-webp.png",
    category: "Optimización Web",
    featuredPosts: true
  },
  {
    name: "Cómo arreglar el bloqueo de Facebook, Instagram o WhatsApp (y cualquier página bloqueada en /etc/hosts)",
    description: [
      {
        "type": "p",
        "text": "¿Facebook, Instagram o WhatsApp dejaron de cargar de repente? 😤 ¿O quizá notas que varias páginas web simplemente no abren, aunque tu conexión esté perfecta? Es muy probable que el problema esté en tu archivo `/etc/hosts`, el cual puede bloquear sitios web a nivel del sistema operativo."
      },
      {
        "type": "p",
        "text": "Este archivo controla qué dominios puede resolver tu computadora. Si contiene entradas que redirigen sitios a `0.0.0.0` o `127.0.0.1`, estás bloqueando manualmente esas páginas (sin que tu navegador tenga la culpa)."
      },
      {
        "type": "p",
        "text": "En este tutorial aprenderás cómo **eliminar todas las reglas que bloquean Facebook, Instagram, WhatsApp y cualquier otra página web**, limpiando tu sistema y restaurando la navegación normal."
      },
      {
        "type": "h2",
        "text": "¿Qué es el archivo /etc/hosts?"
      },
      {
        "type": "p",
        "text": "El archivo `/etc/hosts` es parte fundamental de macOS y Linux. Su función es asociar nombres de dominio con direcciones IP antes de consultar los servidores DNS. Es como una agenda interna del sistema."
      },
      {
        "type": "p",
        "text": "Por ejemplo, si el archivo contiene esta línea: `0.0.0.0 facebook.com`, el sistema enviará todas las solicitudes a una IP vacía, bloqueando completamente la página. Muchas herramientas de productividad o bloqueadores de publicidad usan esta técnica para restringir el acceso a sitios específicos."
      },
      {
        "type": "quote",
        "text": "En resumen: si ves líneas que apuntan a 0.0.0.0 o 127.0.0.1, esas páginas están bloqueadas localmente desde tu sistema operativo."
      },
      {
        "type": "h2",
        "text": "Arreglo en 3 pasos (Terminal)"
      },
      {
        "type": "h3",
        "text": "1) Respalda el archivo hosts"
      },
      {
        "type": "p",
        "text": "Antes de modificar nada, haz una copia de seguridad del archivo original. Así podrás restaurarlo si algo sale mal o si quieres volver al estado anterior."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo cp /etc/hosts /etc/hosts.backup.$(date +%F_%H%M%S)",
        "fileName": "terminal"
      },
      {
        "type": "h3",
        "text": "2) Elimina todas las líneas que bloquean páginas"
      },
      {
        "type": "p",
        "text": "Con este comando, eliminarás automáticamente las líneas que contengan 'facebook', 'fbcdn', 'instagram', 'whatsapp' o cualquier otro dominio que quieras desbloquear. Puedes editar la lista para incluir más sitios si lo deseas:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo sed -i '' -E '/(facebook|fbcdn|instagram|whatsapp)/d' /etc/hosts",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "En macOS usa `-i ''`. En Linux simplemente quítalas comillas (`-i -E`). Si deseas limpiar **todas las páginas bloqueadas** sin escribir cada nombre, puedes borrar **todas las líneas con 0.0.0.0 o 127.0.0.1** así:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo sed -i '' -E '/(0\\.0\\.0\\.0|127\\.0\\.0\\.1)/d' /etc/hosts",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "Esto eliminará cualquier redirección local, restaurando el comportamiento normal del sistema para todos los dominios."
      },
      {
        "type": "h3",
        "text": "3) Limpia la caché DNS del sistema"
      },
      {
        "type": "p",
        "text": "Después de editar el archivo `/etc/hosts`, es necesario limpiar la caché DNS. Esto hace que el sistema olvide las redirecciones anteriores y use las nuevas reglas."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "En macOS, estos comandos reinician el servicio DNS (mDNSResponder). En Linux puedes usar:\n\n`sudo systemd-resolve --flush-caches`\n\nó, si usas `nscd`, ejecuta:\n\n`sudo service nscd restart`."
      },
      {
        "type": "h2",
        "text": "Comprueba que el bloqueo desapareció"
      },
      {
        "type": "p",
        "text": "Haz una pequeña prueba para asegurarte de que las páginas se resuelven correctamente:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "dig +short www.facebook.com\ncurl -I https://www.facebook.com -m 10",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "Si `dig` devuelve direcciones IP reales y `curl` responde con código 200 o 301, el acceso está restaurado. ¡Ya puedes volver a navegar sin bloqueos!"
      },
      {
        "type": "h2",
        "text": "Opción manual: editar el archivo a mano"
      },
      {
        "type": "p",
        "text": "Si prefieres hacerlo visualmente, abre el archivo `/etc/hosts` con un editor de texto en modo administrador y elimina las líneas bloqueadoras una por una:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo nano /etc/hosts",
        "fileName": "terminal"
      },
      {
        "type": "snippet",
        "language": "text",
        "code": "0.0.0.0 facebook.com\n0.0.0.0 www.instagram.com\n0.0.0.0 whatsapp.com\n0.0.0.0 fbcdn.net\n0.0.0.0 twitter.com\n0.0.0.0 youtube.com",
        "fileName": "hosts"
      },
      {
        "type": "p",
        "text": "Guarda con `Ctrl + O`, presiona Enter, y sal con `Ctrl + X`. Luego limpia la caché DNS como en el paso 3."
      },
      {
        "type": "h2",
        "text": "Si vuelve a bloquearse solo"
      },
      {
        "type": "p",
        "text": "Si después de limpiarlo vuelve a llenarse de bloqueos, probablemente alguna app o herramienta está reescribiendo el archivo `/etc/hosts`. Suele pasar con programas como Cold Turkey, Freedom, AdGuard, Focus o listas tipo 'StevenBlack hosts'."
      },
      {
        "type": "p",
        "text": "Para identificarlo, revisa la fecha y hora de la última modificación del archivo:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "stat -x /etc/hosts",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "Si ves que se actualiza solo, desactiva la opción 'bloqueo de sitios a nivel del sistema' en la app que lo modifica."
      },
      {
        "type": "h2",
        "text": "Opcional: proteger el archivo /etc/hosts"
      },
      {
        "type": "p",
        "text": "Si ya lo limpiaste y no quieres que ninguna app vuelva a modificarlo, puedes marcarlo como inmutable (solo lectura para el sistema)."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo chflags uchg /etc/hosts\n# Para volver a permitir cambios:\n# sudo chflags nouchg /etc/hosts",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "Esto funciona en macOS (sistemas con APFS/HFS+). En Linux, puedes usar `chattr +i /etc/hosts` para el mismo efecto."
      },
      {
        "type": "h2",
        "text": "Conclusión"
      },
      {
        "type": "p",
        "text": "El archivo `/etc/hosts` es una herramienta poderosa para redirigir o bloquear sitios, pero también puede volverse una trampa si una app lo modifica sin avisarte. Con esta guía, no solo recuperas el acceso a Facebook, Instagram o WhatsApp, sino que también limpias **todos los bloqueos locales** en tu sistema operativo y aprendes a protegerlo de futuros cambios."
      }
    ],
    date: "16 de octubre, 2025",
    image: "/img/tutoriales/fix-blocked-sites-hosts.jpg",
    category: "Hacks",
    featuredPosts: true
  },
  {
    name: "Cómo descomprimir archivos en Linux sin moverte de carpeta (CyberArk + WinSCP)",
    description: [
      {
        "type": "p",
        "text": "Cuando trabajamos con CyberArk y WinSCP, puede ocurrir que las carpetas no se suban correctamente. Esto sucede porque CyberArk, al ejecutar sesiones a través del PSM (Privileged Session Manager), no tiene acceso directo al sistema de archivos local."
      },
      {
        "type": "h2",
        "text": "⚠️ Por qué ocurre este problema"
      },
      {
        "type": "p",
        "text": "Cuando subes archivos desde el portal o el cliente de CyberArk, todo lo que subes o descargas se redirige a un drive virtual (normalmente Z:) controlado por el PSM Server. Este drive solo acepta archivos individuales y no puede procesar subcarpetas ni estructuras anidadas debido a políticas de aislamiento y auditoría."
      },
      {
        "type": "quote",
        "text": "Por eso, al intentar subir una carpeta (por ejemplo src/), verás que marca 0 B / 0 B: el PSM bloquea su contenido interno."
      },
      {
        "type": "h2",
        "text": "Solución práctica: comprimir antes de subir"
      },
      {
        "type": "p",
        "text": "Una es comprimir la carpeta completa antes de subirla. Luego, una vez dentro del servidor remoto, descomprímela con los pasos siguientes. Existen dos formas principales de hacerlo:"
      },
      {
        "type": "list",
        "items": [
          "Opción 01: entrar al directorio donde se encuentra el archivo comprimido y descomprimirlo ahí mismo.",
          "Opción 02: hacerlo desde cualquier punto del sistema, indicando la ruta completa del archivo y el destino."
        ]
      },
      {
        "type": "h3",
        "text": "1) Verifica el tipo de archivo comprimido"
      },
      {
        "type": "p",
        "text": "Primero, identifica el formato del archivo (.zip o .tar.gz) para saber qué comando usar. El siguiente comando lista los archivos que coinciden con el nombre:"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "ls nombre-del-archivo*",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "Si termina en .zip, usa unzip. Si termina en .tar.gz, usa tar."
      },
      {
        "type": "h3",
        "text": "2) Descomprimir usando rutas completas"
      },
      {
        "type": "p",
        "text": "**Opción 01:** moverte al directorio donde está el archivo comprimido y descomprimirlo directamente ahí. Esto es útil si ya estás en la misma carpeta."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "cd /ruta/del/archivo/\nunzip archivo.zip",
        "fileName": "terminal"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "cd /ruta/del/archivo/\ntar -xzf archivo.tar.gz",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "**Opción 02:** hacerlo desde cualquier punto del sistema sin moverte, especificando las rutas de origen y destino."
      },
      {
        "type": "h4",
        "text": "Ejemplo con .zip"
      },
      {
        "type": "p",
        "text": "Descomprime el archivo ZIP directamente indicando la carpeta de destino (-d)."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "unzip /ruta/donde/esta/archivo.zip -d /ruta/donde/quieres/descomprimir/",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "El parámetro -d indica el destino (destination). Si la carpeta de destino no existe, créala con mkdir -p /ruta/donde/quieres/descomprimir/."
      },
      {
        "type": "h4",
        "text": "Ejemplo con .tar.gz"
      },
      {
        "type": "p",
        "text": "Extrae un archivo .tar.gz desde cualquier ubicación, usando -C para definir el destino."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "tar -xzf /ruta/donde/esta/archivo.tar.gz -C /ruta/donde/quieres/descomprimir/",
        "fileName": "terminal"
      },
      {
        "type": "p",
        "text": "El parámetro -xzf significa: x (extraer), z (descomprimir), f (usar archivo). El modificador -C indica la carpeta de destino."
      },
      {
        "type": "h3",
        "text": "3) Si prefieres moverte solo un nivel dentro del proyecto"
      },
      {
        "type": "p",
        "text": "Puedes entrar parcialmente al proyecto y descomprimir en un subdirectorio específico."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "cd proyecto/\nunzip frontend.zip -d frontend/",
        "fileName": "terminal"
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "cd proyecto/\ntar -xzf frontend.tar.gz -C frontend/",
        "fileName": "terminal"
      },
      {
        "type": "h3",
        "text": "4) Limpieza final (opcional)"
      },
      {
        "type": "p",
        "text": "Una vez verificado el contenido, puedes eliminar el archivo comprimido si ya no lo necesitas."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "rm archivo.zip",
        "fileName": "terminal"
      },
      {
        "type": "h3",
        "text": "5) Si aparece error 'command not found'"
      },
      {
        "type": "p",
        "text": "Instala el descompresor correspondiente según la distribución que uses (solo si tienes permisos)."
      },
      {
        "type": "snippet",
        "language": "bash",
        "code": "sudo yum install unzip   # CentOS / Rocky\n# o\nsudo apt install unzip   # Ubuntu / Debian",
        "fileName": "terminal"
      },
      {
        "type": "h2",
        "text": "Resumen general"
      },
      {
        "type": "table",
        "headers": ["Tipo de archivo", "Comando de extracción", "Ejemplo de uso"],
        "rows": [
          [".zip", "unzip archivo.zip -d destino/", "unzip /home/user/proyecto.zip -d /var/www/"],
          [".tar.gz", "tar -xzf archivo.tar.gz -C destino/", "tar -xzf /home/user/proyecto.tar.gz -C /var/www/"]
        ]
      },
      {
        "type": "h2",
        "text": "Conclusión"
      },
      {
        "type": "p",
        "text": "Si trabajas con CyberArk + WinSCP, siempre comprime tus carpetas antes de subirlas (por ejemplo src.zip o frontend.tar.gz). Luego, una vez dentro del servidor, descomprímelas siguiendo los pasos anteriores. Así evitas los errores de transferencia y respetas las políticas de seguridad del PSM."
      }
    ],
    date: "16 de octubre, 2025",
    image: "/img/tutoriales/linux-unzip-cyberark.png",
    category: "Hacks",
    featuredPosts: true
  },
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
    ],
    date: "20 de septiembre, 2025",
    image: "/img/tutoriales/nextjs-setup-15.png",
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
    image: "/img/tutoriales/django-postgres-dotenv.jpg",
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
    image: "/img/tutoriales/ssh-login.jpg",
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
    image: "/img/tutoriales/docker.svg",
    category: "DevOps",
    featuredPosts: true
  }
];

export const blogPosts = rawBlogPosts.map((post) => {
  const publishedAt = post.publishedAt || toIsoDate(post.date);

  return {
    ...post,
    author: post.author || "Gabriel Gómez Gómez",
    publishedAt,
    updatedAt: post.updatedAt || publishedAt,
  };
});
