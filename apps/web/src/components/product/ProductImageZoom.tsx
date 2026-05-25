interface ProductImageZoomProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export function ProductImageZoom({
  imageUrl,
  alt,
  onClose
}: ProductImageZoomProps) {
  return (
    <aside className="image-zoom-backdrop" onClick={onClose}>
      <div
        className="image-zoom-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose}>
          Fechar
        </button>

        <div className="image-zoom-stage">
          <img src={imageUrl} alt={alt} />
        </div>
      </div>
    </aside>
  );
}