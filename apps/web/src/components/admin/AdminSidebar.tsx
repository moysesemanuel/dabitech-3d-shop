import { useState } from "react";

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
  const [openGroups, setOpenGroups] = useState<string[]>(["Produtos"]);

  function toggleGroup(groupTitle: string) {
    setOpenGroups((current) =>
      current.includes(groupTitle)
        ? current.filter((title) => title !== groupTitle)
        : [...current, groupTitle]
    );
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-card">
        <h2>Administração</h2>
        <div className="admin-menu">
          {adminMenuGroups.map((group) => (
            <section
              key={group.title}
              className={
                openGroups.includes(group.title)
                  ? "admin-menu-group is-open"
                  : "admin-menu-group"
              }
            >
              <button
                className="admin-menu-heading"
                type="button"
                onClick={() => toggleGroup(group.title)}
              >
                <span>{group.title}</span>
                <span className="admin-menu-arrow" aria-hidden="true">▾</span>
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
