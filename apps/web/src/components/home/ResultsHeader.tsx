type HeaderView = "all" | "offers" | "favorites";
type SortOption = "featured" | "price-asc" | "price-desc" | "name";

interface ResultsHeaderProps {
  totalResults: number;
  activeView: HeaderView;
  sortBy: SortOption;
  onChangeSortBy: (sortBy: SortOption) => void;
  onResetStorefront: () => void;
}

export function ResultsHeader({
  totalResults,
  activeView,
  sortBy,
  onChangeSortBy,
  onResetStorefront
}: ResultsHeaderProps) {
  return (
    <div className="results-summary">
      <div>
        <div className="breadcrumb">Home &gt; Produtos 3D &gt; Catálogo</div>

        <h1>Produtos 3D</h1>

        <p>
          {totalResults} resultados
          {activeView === "offers" ? " em ofertas" : ""}
          {activeView === "favorites" ? " nos favoritos" : ""}
        </p>
      </div>

      <div className="summary-actions">
        <button className="ghost-action" type="button" onClick={onResetStorefront}>
          Limpar filtros
        </button>

        <label className="sort-control">
          <span>Ordenar por</span>

          <select
            value={sortBy}
            onChange={(event) => onChangeSortBy(event.target.value as SortOption)}
          >
            <option value="featured">Relevância</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name">Nome</option>
          </select>
        </label>
      </div>
    </div>
  );
}