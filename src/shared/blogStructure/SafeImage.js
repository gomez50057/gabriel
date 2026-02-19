"use client";

import { useEffect, useState } from "react";

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/img/noticias/fallback.webp",
  ...props
}) {
  const initial = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(initial);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    // Evita bucle si el fallback también falla
    setCurrentSrc((prev) => (prev === fallbackSrc ? prev : fallbackSrc));
  };

  return <img {...props} src={currentSrc} alt={alt} onError={handleError} />;
}
