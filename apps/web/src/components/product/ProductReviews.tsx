import { buildRating, buildReviewCount } from "../../lib/product";

interface ProductReviewSample {
  author: string;
  title: string;
  text: string;
  rating: string;
}

interface ProductReviewsProps {
  productIndex: number;
  galleryImages: string[];
  reviews: ProductReviewSample[];
}

export function ProductReviews({
  productIndex,
  galleryImages,
  reviews
}: ProductReviewsProps) {
  return (
    <section className="product-section-card">
      <h2>Opiniões do produto</h2>

      <div className="reviews-summary">
        <div className="reviews-score">
          <strong>{buildRating(productIndex)}</strong>
          <span>★★★★★</span>
          <small>{buildReviewCount(productIndex)} avaliações</small>
        </div>

        <div className="reviews-strip">
          {galleryImages.slice(0, 4).map((image, index) => (
            <div
              key={`review-photo-${index}`}
              className="reviews-strip-thumb"
            >
              {image ? <img src={image} alt={`Avaliação ${index + 1}`} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <article
            key={review.author + review.title}
            className="review-card"
          >
            <div className="review-card-header">
              <strong>{review.author}</strong>
              <span>{review.rating} ★★★★★</span>
            </div>

            <h3>{review.title}</h3>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}