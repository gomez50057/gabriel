import ImageCard from "./ImageCard";

export default function ImageCatalog({
  images,
  selectedImageId,
  disabled,
  onSelectImage,
  onToggleImage,
  onOptimizeImage,
  onDownloadImage,
  onRemoveImage,
  styles,
}) {
  return (
    <section className={styles.catalogPanel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Catalogo</span>
        <h2>Catalogo de imagenes</h2>
      </div>

      {!images.length ? (
        <p className={styles.emptyText}>Aun no hay imagenes cargadas.</p>
      ) : (
        <div className={styles.catalogGrid}>
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isActive={image.id === selectedImageId}
              disabled={disabled}
              onSelect={onSelectImage}
              onToggle={onToggleImage}
              onOptimize={onOptimizeImage}
              onDownload={onDownloadImage}
              onRemove={onRemoveImage}
              styles={styles}
            />
          ))}
        </div>
      )}
    </section>
  );
}
