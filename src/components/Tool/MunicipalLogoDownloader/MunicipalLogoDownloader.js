"use client";

import { useState } from "react";
import Image from "next/image";
import TextAutocomplete from "@/shared/TextAutocomplete/TextAutocomplete";
import { REGIONALIZACION_HIDALGO } from "../MunicipalityLocator/regionalizacionHidalgo";
import styles from "./MunicipalLogoDownloader.module.css";

const WEBP_LOGOS = new Set(["Acaxochitlan", "Apan", "Villa de Tezontepec"]);

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getLogo(municipio) {
  const extension = WEBP_LOGOS.has(normalize(municipio)) ? "webp" : "png";
  const file = `${municipio}-sin fondo.${extension}`;
  const path = `/img/logos_municipales/${municipio}/2024-2027/${file}`;

  return { municipio, file, path: encodeURI(path) };
}

const LOGOS = REGIONALIZACION_HIDALGO.map(({ municipio, aliases }) => ({
  ...getLogo(municipio),
  aliases,
}));

export default function MunicipalLogoDownloader() {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const selected = LOGOS.find(({ municipio }) => municipio === selectedName);

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Logos de municipios de Hidalgo</h1>
        <p>Selecciona un municipio para ver y descargar su logo 2024-2027.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <TextAutocomplete
            id="municipio"
            value={query}
            onChange={setQuery}
            onSelect={(logo) => setSelectedName(logo.municipio)}
            onClear={() => setSelectedName("")}
            options={LOGOS}
            getOptionLabel={(logo) => logo.municipio}
            getSearchValues={(logo) => [logo.municipio, ...(logo.aliases || [])]}
            getOptionKey={(logo) => logo.municipio}
            selectedKey={selectedName}
            label="Buscar municipio"
            placeholder="Ej. Pachuca de Soto"
            promptText="Escribe el nombre de un municipio."
            emptyText="No se encontraron municipios."
            classNames={{
              inputWrapper: styles.inputWrapper,
              clearButton: styles.clearButton,
              list: styles.list,
              option: styles.option,
              selectedOption: styles.selected,
              activeOption: styles.selected,
            }}
          />
        </div>

        <div className={`${styles.panel} ${styles.preview}`}>
          {selected ? (
            <>
              <div className={styles.logoPreview}>
                <Image
                  alt={`Logo de ${selected.municipio}`}
                  src={selected.path}
                  fill
                  sizes="400px"
                />
              </div>
              <h2>{selected.municipio}</h2>
              <a download={selected.file} href={selected.path}>
                Descargar logo
              </a>
            </>
          ) : (
            <p>Elige un municipio de la lista.</p>
          )}
        </div>
      </div>
    </section>
  );
}
