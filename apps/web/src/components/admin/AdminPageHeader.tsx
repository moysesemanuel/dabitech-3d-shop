interface AdminPageHeaderProps {
  onResetAdminContent: () => void | Promise<void>;
  onCloseAdmin: () => void;
}

export function AdminPageHeader({
  onResetAdminContent,
  onCloseAdmin
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <span className="panel-kicker">Painel admin</span>
        <h1>Editar conteúdo da loja</h1>
        <p>
          Altere banners, cards e catálogo rapidamente. As mudanças ficam salvas neste
          navegador.
        </p>
      </div>

      <div className="admin-page-header-actions">
        <button className="ghost-action" type="button" onClick={onResetAdminContent}>
          Restaurar padrão
        </button>
        <button className="close-button" type="button" onClick={onCloseAdmin}>
          Voltar para loja
        </button>
      </div>
    </div>
  );
}
