import type { Category, Product } from "../../types";

interface ProductFiltersProps {
  categories: Category[];
  products: Product[];
  materials: string[];
  activeCategory: string;
  activeMaterial: string;
  onChangeCategory: (categoryId: string) => void;
  onChangeMaterial: (material: string) => void;
}

export function ProductFilters({
  categories,
  products,
  materials,
  activeCategory,
  activeMaterial,
  onChangeCategory,
  onChangeMaterial
}: ProductFiltersProps) {
  return (
    <aside className="filters-panel">
      <div className="filter-card">
        <h2>Filtros</h2>

        <div className="filter-group">
          <strong>Categorias</strong>

          {categories.map((category) => (
            <button
              key={category.id}
              className={
                activeCategory === category.id
                  ? "filter-option active"
                  : "filter-option"
              }
              type="button"
              onClick={() => onChangeCategory(category.id)}
            >
              <span>{category.label}</span>

              <small>
                {category.id === "all"
                  ? products.length
                  : products.filter((product) => product.category === category.id)
                      .length}
              </small>
            </button>
          ))}
        </div>

        <div className="filter-group">
          <strong>Material</strong>

          <button
            className={
              activeMaterial === "all"
                ? "filter-option active"
                : "filter-option"
            }
            type="button"
            onClick={() => onChangeMaterial("all")}
          >
            <span>Todos</span>
          </button>

          {materials.map((material) => (
            <button
              key={material}
              className={
                activeMaterial === material
                  ? "filter-option active"
                  : "filter-option"
              }
              type="button"
              onClick={() => onChangeMaterial(material)}
            >
              <span>{material}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}