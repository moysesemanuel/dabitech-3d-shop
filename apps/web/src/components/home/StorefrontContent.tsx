import type { Category, Product } from "../../types";
import { ProductFilters } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { PromoStrip, type PromoCard } from "./PromoStrip";
import { ResultsHeader } from "./ResultsHeader";

type HeaderView = "all" | "offers" | "favorites";
type SortOption = "featured" | "price-asc" | "price-desc" | "name";

interface StorefrontContentProps {
  promoCards: PromoCard[];
  categories: Category[];
  catalogProducts: Product[];
  visibleProducts: Product[];
  materials: string[];
  activeCategory: string;
  activeMaterial: string;
  activeView: HeaderView;
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
  favoriteIds: string[];
  onChangeCategory: (categoryId: string) => void;
  onChangeMaterial: (material: string) => void;
  onChangeSortBy: (sortBy: SortOption) => void;
  onOpenProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onResetStorefront: () => void;
}

export function StorefrontContent({
  promoCards,
  categories,
  catalogProducts,
  visibleProducts,
  materials,
  activeCategory,
  activeMaterial,
  activeView,
  sortBy,
  isLoading,
  error,
  favoriteIds,
  onChangeCategory,
  onChangeMaterial,
  onChangeSortBy,
  onOpenProduct,
  onToggleFavorite,
  onResetStorefront
}: StorefrontContentProps) {
  return (
    <main className="marketplace-content">
      <PromoStrip promoCards={promoCards} />

      <section className="results-shell">
        <ProductFilters
          categories={categories}
          products={catalogProducts}
          materials={materials}
          activeCategory={activeCategory}
          activeMaterial={activeMaterial}
          onChangeCategory={onChangeCategory}
          onChangeMaterial={onChangeMaterial}
        />

        <section className="results-panel">
          <div id="results-panel" />

          <ResultsHeader
            totalResults={visibleProducts.length}
            activeView={activeView}
            sortBy={sortBy}
            onChangeSortBy={onChangeSortBy}
            onResetStorefront={onResetStorefront}
          />

          <ProductList
            products={visibleProducts}
            activeView={activeView}
            isLoading={isLoading}
            error={error}
            favoriteIds={favoriteIds}
            onOpenProduct={onOpenProduct}
            onToggleFavorite={onToggleFavorite}
            onResetStorefront={onResetStorefront}
          />
        </section>
      </section>
    </main>
  );
}
