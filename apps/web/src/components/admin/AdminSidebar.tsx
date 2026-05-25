import { adminMenuGroups, type AdminSection } from "./adminSections";

interface AdminSidebarProps {
  adminSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
  onResetStorefront: () => void;
  onAddNewProduct: () => void | Promise<void>;
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
        <h2>Administração</h2>
        <div className="admin-menu">
          {adminMenuGroups.map((group) => (
            <section key={group.title} className="admin-menu-group">
              <button className="admin-menu-heading" type="button">
                <span>{group.title}</span>
                <span aria-hidden="true">▾</span>
              </button>

              <div className="admin-submenu">
                {group.items.map((item) => (
                  <button
                    key={item.section}
                    className={
                      adminSection === item.section
                        ? "ghost-action active-ghost"
                        : "ghost-action"
                    }
                    type="button"
                    onClick={() => {
                      if (item.action === "create-product") {
                        onAddNewProduct();
                        return;
                      }

                      onChangeSection(item.section);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
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
