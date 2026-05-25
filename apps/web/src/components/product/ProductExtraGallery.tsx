interface ProductExtraGalleryProps {
  productId: string;
  productName: string;
  images: string[];
}

export function ProductExtraGallery({
  productId,
  productName,
  images
}: ProductExtraGalleryProps) {
  const extraImages = images.slice(1);

  if (extraImages.length === 0) {
    return null;
  }

  return (
    <section className="product-section-card">
      <h2>Fotos do produto</h2>

      <div className="product-extra-gallery">
        {extraImages.map((image, index) => (
          <article
            key={`${productId}-extra-${index}`}
            className="product-extra-shot"
          >
            <img
              src={image}
              alt={`${productName} detalhe ${index + 1}`}
            />
          </article>
        ))}
      </div>
    </section>
  );
}