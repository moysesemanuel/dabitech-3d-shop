type AdminSection = "slides" | "promos" | "products";

interface AdminSidebarProps {
  adminSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
  onResetStorefront: () => void;
  onAddNewProduct: () => void;
}

export function AdminSidebar({
  adminSection,
  onChangeSection,
  onResetStorefront,
  onAddNewProduct
}: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="filter-card admin-sidebar-card">
        <h2>Seções</h2>
        <div className="admin-toolbar">
          <button
            className={adminSection === "slides" ? "ghost-action active-ghost" : "ghost-action"}
            type="button"
            onClick={() => onChangeSection("slides")}
          >
            Carrossel
          </button>
          <button
            className={adminSection === "promos" ? "ghost-action active-ghost" : "ghost-action"}
            type="button"
            onClick={() => onChangeSection("promos")}
          >
            Cards
          </button>
          <button
            className={adminSection === "products" ? "ghost-action active-ghost" : "ghost-action"}
            type="button"
            onClick={() => onChangeSection("products")}
          >
            Produtos
          </button>
        </div>

        <div className="admin-actions">
          <button className="ghost-action" type="button" onClick={onResetStorefront}>
            Ver vitrine
          </button>
          <button className="admin-primary-action" type="button" onClick={onAddNewProduct}>
            Novo produto
          </button>
        </div>
      </div>
    </aside>
  );
}
