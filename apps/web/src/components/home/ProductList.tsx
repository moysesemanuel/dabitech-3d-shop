import type { CSSProperties } from "react";
import type { Product } from "../../types";
import { formatCurrency } from "../../lib/currency";
import { buildRating, buildReviewCount } from "../../lib/product";

type HeaderView = "all" | "offers" | "favorites";

interface ProductListProps {
  products: Product[];
  activeView: HeaderView;
  isLoading: boolean;
  error: string | null;
  favoriteIds: string[];
  onOpenProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onResetStorefront: () => void;
}

export function ProductList({
  products,
  activeView,
  isLoading,
  error,
  favoriteIds,
  onOpenProduct,
  onToggleFavorite,
  onResetStorefront
}: ProductListProps) {
  return (
    <>
      {isLoading ? <p className="status-text">Carregando produtos...</p> : null}

      {error ? <p className="status-text error">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="product-list">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="product-row"
              style={{ "--accent": product.accentColor } as CSSProperties}
            >
              <button
                className={product.imageUrl ? "product-thumb has-image" : "product-thumb"}
                type="button"
                onClick={() => onOpenProduct(product)}
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

                {product.featured ? (
                  <span className="product-offer-badge">Oferta imperdível</span>
                ) : null}
              </button>

              <button
                className={
                  favoriteIds.includes(product.id)
                    ? "product-favorite-button active"
                    : "product-favorite-button"
                }
                type="button"
                aria-label={
                  favoriteIds.includes(product.id)
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
                onClick={() => onToggleFavorite(product.id)}
              >
                ♡
              </button>

              <div className="product-info">
                <div className="product-title-row">
                  <button
                    className="product-title-button"
                    type="button"
                    onClick={() => onOpenProduct(product)}
                  >
                    <h3>{product.name}</h3>
                  </button>
                </div>

                <div className="rating-row">
                  <span className="rating-star">★</span>
                  <span className="rating-score">{buildRating(index)}</span>
                  <span className="rating-count">| +{buildReviewCount(index)} vendidos</span>
                </div>

                <div className="buy-box">
                  <strong>{formatCurrency(product.priceInCents)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <div className="empty-state">
          <strong>
            {activeView === "favorites"
              ? "Nenhum favorito encontrado."
              : "Nenhum produto encontrado."}
          </strong>

          <p>
            {activeView === "favorites"
              ? "Salve produtos e volte aqui para comparar depois."
              : "Tente outro termo de busca ou limpe os filtros atuais."}
          </p>

          <button className="ghost-action" type="button" onClick={onResetStorefront}>
            Resetar visualização
          </button>
        </div>
      ) : null}
    </>
  );
}
