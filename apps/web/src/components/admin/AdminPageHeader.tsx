import { useState } from "react";

import { DabiLogo } from "../layout/DabiLogo";

interface AdminPageHeaderProps {
  onResetAdminContent: () => void | Promise<void>;
  onCloseAdmin: () => void;
}

export function AdminPageHeader({
  onResetAdminContent,
  onCloseAdmin
}: AdminPageHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="admin-topbar">
      <button className="admin-topbar-logo reset-button" type="button" onClick={onCloseAdmin}>
        <DabiLogo className="admin-logo-image" />
      </button>

      <div className="admin-search-shell">
        <select aria-label="Tipo de busca">
          <option>Produto</option>
          <option>Pedido</option>
        </select>
        <label className="admin-searchbar">
          <input placeholder="Buscar no painel..." />
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
          </span>
        </label>
      </div>

      <div className="admin-topbar-actions">
        <button className="admin-icon-button" type="button" aria-label="Notificações">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2V9Z" />
            <path d="M10 18a2 2 0 0 0 4 0" />
          </svg>
          <span>3</span>
        </button>

        <button className="admin-news-button" type="button">
          Novidades
          <span>2</span>
        </button>

        <button className="admin-icon-button" type="button" aria-label="Mensagens">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5A3.5 3.5 0 0 1 16.5 15H11l-5 4v-4.2A3.5 3.5 0 0 1 4 11.5v-5Z" />
          </svg>
        </button>

        <div className="admin-profile-shell">
          <button
            className="admin-profile-button"
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
          >
            <span>M</span>
          </button>

          {isProfileOpen ? (
            <div className="admin-profile-dropdown">
              <section>
                <button className="admin-profile-store-button" type="button" onClick={onCloseAdmin}>
                  Ver a loja
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 4h6v6" />
                    <path d="M10 14 20 4" />
                    <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
                  </svg>
                </button>
              </section>

              <section>
                <h3>Tema do painel</h3>
                <div className="admin-theme-options">
                  <button type="button">Claro</button>
                  <button type="button">Escuro</button>
                  <button className="is-active" type="button">Auto</button>
                </div>
              </section>

              <section>
                <h3>Loja</h3>
                <strong>DaBi Tech 3D</strong>
              </section>

              <section>
                <h3>Minha conta</h3>
                <button type="button">Alterar senha</button>
                <button type="button">Dados cadastrais</button>
                <button type="button">Sair da conta</button>
              </section>

              <section>
                <button className="ghost-action" type="button" onClick={onResetAdminContent}>
                  Restaurar padrão
                </button>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
