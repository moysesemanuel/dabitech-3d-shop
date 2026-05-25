import type { CSSProperties } from "react";

interface ProductGalleryProps {
  productId: string;
  productName: string;
  accentColor: string;
  gallery: string[];
  activeImageIndex: number;
  mainImage: string;
  onChangeImage: (index: number) => void;
  onOpenZoom: () => void;
}

export function ProductGallery({
  productId,
  productName,
  accentColor,
  gallery,
  activeImageIndex,
  mainImage,
  onChangeImage,
  onOpenZoom
}: ProductGalleryProps) {
  const images = gallery.length > 0 ? gallery : [""];

  return (
    <div className="product-gallery-panel">
      <div className="product-thumb-list">
        {images.map((image, index) => (
          <button
            key={`${productId}-thumb-${index}`}
            className={
              index === activeImageIndex
                ? "product-page-thumb is-active"
                : "product-page-thumb"
            }
            type="button"
            onClick={() => onChangeImage(index)}
          >
            {image ? (
              <img src={image} alt={`${productName} ${index + 1}`} />
            ) : (
              <div className="product-glow" />
            )}
          </button>
        ))}
      </div>

      <button
        className={mainImage ? "product-stage has-image" : "product-stage"}
        style={{ "--accent": accentColor } as CSSProperties}
        type="button"
        onClick={() => {
          if (mainImage) {
            onOpenZoom();
          }
        }}
      >
        {mainImage ? (
          <img
            className="product-stage-image"
            src={mainImage}
            alt={productName}
          />
        ) : (
          <div className="product-glow" />
        )}
      </button>
    </div>
  );
}