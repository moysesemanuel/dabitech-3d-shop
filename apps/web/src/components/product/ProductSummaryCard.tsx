import type { Product, ProductColorOption } from "../../types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

interface ProductSummaryCardProps {
  product: Product;
  productIndex: number;
  gallery: string[];
  activeImageIndex: number;
  mainImage: string;
  selectedColorOption: ProductColorOption | null;
  selectedColorOptionId: string | null;
  featureBullets: string[];
  onChangeImage: (index: number) => void;
  onOpenZoom: () => void;
  onSelectColorOption: (colorOptionId: string) => void;
}

export function ProductSummaryCard({
  product,
  productIndex,
  gallery,
  activeImageIndex,
  mainImage,
  selectedColorOption,
  selectedColorOptionId,
  featureBullets,
  onChangeImage,
  onOpenZoom,
  onSelectColorOption
}: ProductSummaryCardProps) {
  return (
    <section className="product-summary-card">
      <ProductGallery
        productId={product.id}
        productName={product.name}
        accentColor={product.accentColor}
        gallery={gallery}
        activeImageIndex={activeImageIndex}
        mainImage={mainImage}
        onChangeImage={onChangeImage}
        onOpenZoom={onOpenZoom}
      />

      <ProductInfo
        product={product}
        productIndex={productIndex}
        selectedColorOption={selectedColorOption}
        selectedColorOptionId={selectedColorOptionId}
        featureBullets={featureBullets}
        onSelectColorOption={onSelectColorOption}
      />
    </section>
  );
}