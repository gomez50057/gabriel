"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/img/fallback.webp",
  width = 1200,
  height = 675,
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

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
    />
  );
}
