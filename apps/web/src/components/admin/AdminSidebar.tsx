import { useState } from "react";

import { BoxArrowUpRightIcon } from "../icons/BoxArrowUpRightIcon";
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
  const [openGroup, setOpenGroup] = useState("Produtos");

  function toggleGroup(groupTitle: string) {
    setOpenGroup((current) => (current === groupTitle ? "" : groupTitle));
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
                [
                  "admin-menu-group",
                  openGroup === group.title ? "is-open" : "",
                  group.items.some((item) => item.section === adminSection) ? "is-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")
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
          <button className="admin-storefront-link" type="button" onClick={onResetStorefront}>
            <span>Ver vitrine</span>
            <BoxArrowUpRightIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
