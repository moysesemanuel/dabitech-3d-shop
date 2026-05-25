type AdminSection = "slides" | "promos" | "products";

interface AdminPanelHeaderProps {
  adminSection: AdminSection;
}

export function AdminPanelHeader({ adminSection }: AdminPanelHeaderProps) {
  return (
    <div className="admin-page-panel-header">
      <div>
        <span className="panel-kicker">
          {adminSection === "slides"
            ? "Carrossel"
            : adminSection === "promos"
              ? "Cards"
              : "Produtos"}
        </span>
        <h2>
          {adminSection === "slides"
            ? "Banners principais"
            : adminSection === "promos"
              ? "Faixa promocional"
              : "Catálogo da loja"}
        </h2>
      </div>
    </div>
  );
}
