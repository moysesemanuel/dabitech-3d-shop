import type { Product, ProductColorOption } from "../../types";
import { buildInstallment, formatCurrency } from "../../lib/currency";
import { buildRating, buildReviewCount } from "../../lib/product";

interface ProductInfoProps {
  product: Product;
  productIndex: number;
  selectedColorOption: ProductColorOption | null;
  selectedColorOptionId: string | null;
  featureBullets: string[];
  onSelectColorOption: (colorOptionId: string) => void;
}

export function ProductInfo({
  product,
  productIndex,
  selectedColorOption,
  selectedColorOptionId,
  featureBullets,
  onSelectColorOption
}: ProductInfoProps) {
  return (
    <div className="product-page-info">
      <span className="product-page-kicker">
        {product.featured ? "Novo" : "Catálogo"} | +
        {120 + productIndex * 17} vendidos
      </span>

      <h1>{product.name}</h1>

      <div className="rating-row product-page-rating">
        <span className="rating-score">{buildRating(productIndex)}</span>
        <span className="rating-stars">★★★★★</span>
        <span className="rating-count">({buildReviewCount(productIndex)})</span>
      </div>

      <div className="product-page-price">
        <strong>{formatCurrency(product.priceInCents)}</strong>
        <small>{buildInstallment(product.priceInCents)}</small>
        <span className="shipping-badge">Frete grátis</span>
      </div>

      <p className="product-page-description">{product.description}</p>

      <div className="tag-row detail-tags">
        {product.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      {product.colorOptions && product.colorOptions.length > 0 ? (
        <section className="product-color-picker">
          <h2>Cores: {selectedColorOption?.name ?? "Selecione uma opção"}</h2>

          <div className="product-color-options">
            {product.colorOptions.map((option) => (
              <button
                key={option.id}
                className={
                  option.id === selectedColorOptionId
                    ? "product-color-option is-active"
                    : "product-color-option"
                }
                type="button"
                onClick={() => onSelectColorOption(option.id)}
              >
                <span className="product-color-swatch-group">
                  {option.swatches.map((swatch) => (
                    <span
                      key={`${option.id}-${swatch}`}
                      className="product-color-swatch"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </span>

                <small>{option.name}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="product-highlights">
        <h2>O que você precisa saber sobre este produto</h2>

        <ul>
          {featureBullets.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}