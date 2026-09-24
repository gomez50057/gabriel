"use client";

import { useEffect, useMemo, useState } from "react";

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 640;
const PADDING = 18;

function getRings(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function flattenCoordinates(geometry) {
  return getRings(geometry).flat(2);
}

function createProjection(features) {
  const coordinates = features.flatMap((feature) => flattenCoordinates(feature.geometry));
  const latitudes = coordinates.map(([, latitude]) => latitude);
  const middleLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const longitudeFactor = Math.cos((middleLatitude * Math.PI) / 180);
  const projected = coordinates.map(([longitude, latitude]) => [longitude * longitudeFactor, latitude]);
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(
    (VIEWBOX_WIDTH - PADDING * 2) / (maxX - minX),
    (VIEWBOX_HEIGHT - PADDING * 2) / (maxY - minY)
  );
  const contentWidth = (maxX - minX) * scale;
  const contentHeight = (maxY - minY) * scale;
  const offsetX = (VIEWBOX_WIDTH - contentWidth) / 2;
  const offsetY = (VIEWBOX_HEIGHT - contentHeight) / 2;

  return ([longitude, latitude]) => [
    offsetX + (longitude * longitudeFactor - minX) * scale,
    VIEWBOX_HEIGHT - offsetY - (latitude - minY) * scale,
  ];
}

function geometryToPath(geometry, project) {
  return getRings(geometry)
    .map((polygon) =>
      polygon
        .map((ring) =>
          ring
            .map((coordinate, index) => {
              const [x, y] = project(coordinate);
              return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ") + " Z"
        )
        .join(" ")
    )
    .join(" ");
}

function getFeatureClass(featureId, states, styles) {
  const classes = [styles.mapMunicipality];

  if (states.discoveredIds?.has(featureId)) classes.push(styles.mapDiscovered);
  if (states.targetId === featureId) classes.push(styles.mapTarget);
  if (states.correctId === featureId) classes.push(styles.mapCorrect);
  if (states.incorrectId === featureId) classes.push(styles.mapIncorrect);

  return classes.join(" ");
}

export default function HidalgoMap({
  targetId = "",
  correctId = "",
  incorrectId = "",
  discoveredIds = new Set(),
  interactive = false,
  onSelect,
  styles,
}) {
  const [geoJson, setGeoJson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/data/hidalgo-municipios.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("No fue posible cargar el mapa de Hidalgo.");
        return response.json();
      })
      .then((data) => {
        if (active) setGeoJson(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const mapFeatures = useMemo(() => {
    if (!geoJson?.features?.length) return [];

    const project = createProjection(geoJson.features);
    return geoJson.features.map((feature) => ({
      ...feature,
      path: geometryToPath(feature.geometry, project),
    }));
  }, [geoJson]);

  if (error) return <div className={styles.mapMessage}>{error}</div>;
  if (!mapFeatures.length) return <div className={styles.mapMessage}>Cargando mapa municipal…</div>;

  const handleKeyDown = (event, featureId) => {
    if (!interactive || !onSelect) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(featureId);
    }
  };

  return (
    <div className={styles.mapFrame}>
      <svg
        className={styles.mapSvg}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label="Mapa de los 84 municipios del Estado de Hidalgo"
      >
        {mapFeatures.map((feature) => {
          const id = feature.properties.id;
          const name = feature.properties.name;

          return (
            <path
              key={id}
              d={feature.path}
              className={getFeatureClass(
                id,
                { targetId, correctId, incorrectId, discoveredIds },
                styles
              )}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? `Seleccionar municipio ${name}` : name}
              onClick={() => interactive && onSelect?.(id)}
              onKeyDown={(event) => handleKeyDown(event, id)}
            />
          );
        })}
      </svg>
      <div className={styles.mapLegend} aria-label="Leyenda del mapa">
        <span><i className={styles.legendNeutral} /> Municipio</span>
        {(targetId || discoveredIds.size > 0) && <span><i className={styles.legendTarget} /> Objetivo o descubierto</span>}
        {correctId && <span><i className={styles.legendCorrect} /> Correcto</span>}
        {incorrectId && <span><i className={styles.legendIncorrect} /> Selección incorrecta</span>}
      </div>
    </div>
  );
}
