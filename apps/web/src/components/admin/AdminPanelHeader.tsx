import { adminSectionLabels, type AdminSection } from "./adminSections";

interface AdminPanelHeaderProps {
  adminSection: AdminSection;
}

export function AdminPanelHeader({ adminSection }: AdminPanelHeaderProps) {
  const content = adminSectionLabels[adminSection];

  return (
    <div className="admin-page-panel-header">
      <div>
        <span className="panel-kicker">Painel admin</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
    </div>
  );
}
