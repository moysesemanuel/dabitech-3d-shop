import type { ChangeEvent, DragEvent } from "react";

import type { Category, Product } from "../../types";
import { formatCurrency } from "../../lib/currency";
import { AdminProductEditor } from "./AdminProductEditor";

interface AdminProductListProps {
  products: Product[];
  categories: Category[];
  activeAdminProductId: string | null;
  adminProductDraft: Product | null;
  isGeneratingAdminDescription: boolean;
  onOpenAdminProductEditor: (product: Product) => void;
  onCancelAdminProductEditor: () => void;
  onSaveAdminProductEditor: () => void | Promise<void>;
  onRemoveProduct: (productId: string) => void | Promise<void>;
  onUpdateAdminProductDraft: (field: keyof Product, value: string | boolean) => void;
  onUpdateAdminProductDraftDimensions: (field: "width" | "height", value: string) => void;
  onGenerateAdminDraftDescription: () => void;
  onProductImageInput: (productId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onProductImageDrop: (productId: string, event: DragEvent<HTMLLabelElement>) => void;
  onProductGalleryInput: (productId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onProductGalleryDrop: (productId: string, event: DragEvent<HTMLLabelElement>) => void;
  onRemoveAdminProductDraftGalleryImage: (imageIndex: number) => void;
}

export function AdminProductList({
  products,
  categories,
  activeAdminProductId,
  adminProductDraft,
  isGeneratingAdminDescription,
  onOpenAdminProductEditor,
  onCancelAdminProductEditor,
  onSaveAdminProductEditor,
  onRemoveProduct,
  onUpdateAdminProductDraft,
  onUpdateAdminProductDraftDimensions,
  onGenerateAdminDraftDescription,
  onProductImageInput,
  onProductImageDrop,
  onProductGalleryInput,
  onProductGalleryDrop,
  onRemoveAdminProductDraftGalleryImage
}: AdminProductListProps) {
  return (
    <div className="admin-list">
      <div className="admin-product-list">
        {products.map((product) => (
          <article
            key={product.id}
            className={
              activeAdminProductId === product.id
                ? "admin-product-row is-expanded"
                : "admin-product-row"
            }
          >
            <div className="admin-product-main">
              <strong>{product.name}</strong>
              <span>{product.category}</span>
              <span>{formatCurrency(product.priceInCents)}</span>
            </div>
            <div className="admin-product-actions">
              <button
                className={
                  activeAdminProductId === product.id
                    ? "ghost-action active-ghost"
                    : "ghost-action"
                }
                type="button"
                onClick={() => {
                  if (activeAdminProductId === product.id) {
                    onCancelAdminProductEditor();
                    return;
                  }

                  onOpenAdminProductEditor(product);
                }}
              >
                {activeAdminProductId === product.id ? "Fechar" : "Editar"}
              </button>
              <button
                className="ghost-action danger-ghost"
                type="button"
                onClick={() => onRemoveProduct(product.id)}
              >
                Deletar
              </button>
            </div>

            {activeAdminProductId === product.id && adminProductDraft?.id === product.id ? (
              <AdminProductEditor
                product={adminProductDraft}
                categories={categories}
                isGeneratingAdminDescription={isGeneratingAdminDescription}
                onUpdateAdminProductDraft={onUpdateAdminProductDraft}
                onUpdateAdminProductDraftDimensions={onUpdateAdminProductDraftDimensions}
                onGenerateAdminDraftDescription={onGenerateAdminDraftDescription}
                onProductImageInput={onProductImageInput}
                onProductImageDrop={onProductImageDrop}
                onProductGalleryInput={onProductGalleryInput}
                onProductGalleryDrop={onProductGalleryDrop}
                onRemoveAdminProductDraftGalleryImage={onRemoveAdminProductDraftGalleryImage}
                onCancelAdminProductEditor={onCancelAdminProductEditor}
                onSaveAdminProductEditor={onSaveAdminProductEditor}
              />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
