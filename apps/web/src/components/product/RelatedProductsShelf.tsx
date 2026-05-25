import type { Product } from "../../types";
import { formatCurrency } from "../../lib/currency";

interface RelatedProductsShelfProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export function RelatedProductsShelf({
  products,
  onOpenProduct
}: RelatedProductsShelfProps) {
  return (
    <section className="product-section-card">
      <h2>Quem viu esse produto também comprou</h2>

      <div className="related-shelf">
        {products.map((product) => (
          <button
            key={product.id}
            className="related-card"
            type="button"
            onClick={() => onOpenProduct(product)}
          >
            <div
              className={
                product.imageUrl
                  ? "related-card-thumb has-image"
                  : "related-card-thumb"
              }
            >
              {product.imageUrl ? (
                <img
                  className="product-image"
                  src={product.imageUrl}
                  alt={product.name}
                />
              ) : (
                <div className="product-glow" />
              )}
            </div>

            <strong>{product.name}</strong>
            <span>{formatCurrency(product.priceInCents)}</span>
            <small>{product.material}</small>
          </button>
        ))}
      </div>
    </section>
  );
}