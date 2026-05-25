import type { Product } from "../../types";
import { formatCurrency } from "../../lib/currency";

interface SellerShelfProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export function SellerShelf({ products, onOpenProduct }: SellerShelfProps) {
  return (
    <section className="product-section-card">
      <h2>Produtos do mesmo estúdio</h2>

      <div className="seller-shelf">
        {products.slice(0, 2).map((product) => (
          <button
            key={product.id}
            className="seller-shelf-card"
            type="button"
            onClick={() => onOpenProduct(product)}
          >
            <div
              className={
                product.imageUrl
                  ? "seller-shelf-thumb has-image"
                  : "seller-shelf-thumb"
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
          </button>
        ))}
      </div>
    </section>
  );
}