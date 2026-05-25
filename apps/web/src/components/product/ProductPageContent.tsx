import type { Product, ProductColorOption } from "../../types";
import { ProductBuyPanel } from "./ProductBuyPanel";
import { ProductDescription } from "./ProductDescription";
import { ProductExtraGallery } from "./ProductExtraGallery";
import { ProductFeatures } from "./ProductFeatures";
import { ProductImageZoom } from "./ProductImageZoom";
import { ProductQuestions } from "./ProductQuestions";
import { ProductReviews } from "./ProductReviews";
import { ProductSummaryCard } from "./ProductSummaryCard";
import { RelatedProductsShelf } from "./RelatedProductsShelf";
import { SellerShelf } from "./SellerShelf";
import { StoreInfoSection } from "./StoreInfoSection";

interface ProductReviewSample {
  author: string;
  title: string;
  text: string;
  rating: string;
}

interface ProductPageContentProps {
  product: Product;
  productIndex: number;
  categoryLabel: string;
  gallery: string[];
  activeImageIndex: number;
  mainImage: string;
  selectedColorOption: ProductColorOption | null;
  selectedColorOptionId: string | null;
  featureBullets: string[];
  reviewSamples: ProductReviewSample[];
  relatedProducts: Product[];
  favoriteIds: string[];
  isImageZoomOpen: boolean;
  onBack: () => void;
  onChangeImage: (index: number) => void;
  onOpenZoom: () => void;
  onCloseZoom: () => void;
  onSelectColorOption: (colorOptionId: string) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
}

export function ProductPageContent({
  product,
  productIndex,
  categoryLabel,
  gallery,
  activeImageIndex,
  mainImage,
  selectedColorOption,
  selectedColorOptionId,
  featureBullets,
  reviewSamples,
  relatedProducts,
  favoriteIds,
  isImageZoomOpen,
  onBack,
  onChangeImage,
  onOpenZoom,
  onCloseZoom,
  onSelectColorOption,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite
}: ProductPageContentProps) {
  return (
    <main className="marketplace-content product-page-content">
      <div className="product-breadcrumb">
        <button className="product-back-button" type="button" onClick={onBack}>
          Voltar
        </button>

        <span>Home &gt;</span>
        <span>{categoryLabel} &gt;</span>
        <span>{product.name}</span>
      </div>

      <section className="product-page">
        <div className="product-main-column">
          <ProductSummaryCard
            product={product}
            productIndex={productIndex}
            gallery={gallery}
            activeImageIndex={activeImageIndex}
            mainImage={mainImage}
            selectedColorOption={selectedColorOption}
            selectedColorOptionId={selectedColorOptionId}
            featureBullets={featureBullets}
            onChangeImage={onChangeImage}
            onOpenZoom={onOpenZoom}
            onSelectColorOption={onSelectColorOption}
          />

          <SellerShelf
            products={relatedProducts}
            onOpenProduct={onOpenProduct}
          />

          <ProductFeatures tags={product.tags} />

          <ProductExtraGallery
            productId={product.id}
            productName={product.name}
            images={gallery}
          />

          <ProductDescription
            description={product.description}
            categoryLabel={categoryLabel}
          />

          <ProductQuestions />

          <ProductReviews
            productIndex={productIndex}
            galleryImages={gallery}
            reviews={reviewSamples}
          />

          <RelatedProductsShelf
            products={relatedProducts}
            onOpenProduct={onOpenProduct}
          />

          <StoreInfoSection />
        </div>

        <ProductBuyPanel
          productId={product.id}
          isFavorite={favoriteIds.includes(product.id)}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      </section>

      {isImageZoomOpen ? (
        <ProductImageZoom
          imageUrl={mainImage}
          alt={product.name}
          onClose={onCloseZoom}
        />
      ) : null}
    </main>
  );
}