import type { Product } from "../../types";
import { formatCurrency } from "../../lib/currency";

interface AdminProductListProps {
  products: Product[];
  onOpenAdminProductEditor: (product: Product) => void;
  onRemoveProduct: (productId: string) => void | Promise<void>;
}

export function AdminProductList({
  products,
  onOpenAdminProductEditor,
  onRemoveProduct
}: AdminProductListProps) {
  return (
    <div className="admin-list">
      <div className="admin-product-list">
        {products.map((product) => (
          <article key={product.id} className="admin-product-row">
            <div className="admin-product-main">
              <strong>{product.name}</strong>
              <span>{product.category}</span>
              <span>{formatCurrency(product.priceInCents)}</span>
            </div>
            <div className="admin-product-actions">
              <button
                className="ghost-action"
                type="button"
                onClick={() => onOpenAdminProductEditor(product)}
              >
                Editar
              </button>
              <button
                className="ghost-action danger-ghost"
                type="button"
                onClick={() => onRemoveProduct(product.id)}
              >
                Deletar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
