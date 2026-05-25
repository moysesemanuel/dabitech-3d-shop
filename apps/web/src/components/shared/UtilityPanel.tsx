type UtilityPanelType = "coupons" | "orders" | "contact";

interface Coupon {
  code: string;
  description: string;
}

interface Order {
  id: string;
  status: string;
  product: string;
}

interface UtilityPanelProps {
  activePanel: UtilityPanelType;
  coupons: Coupon[];
  orders: Order[];
  onClose: () => void;
}

export function UtilityPanel({
  activePanel,
  coupons,
  orders,
  onClose
}: UtilityPanelProps) {
  const panelKicker =
    activePanel === "coupons"
      ? "Cupons"
      : activePanel === "orders"
        ? "Compras"
        : "Contato";

  const panelTitle =
    activePanel === "coupons"
      ? "Benefícios da loja"
      : activePanel === "orders"
        ? "Pedidos recentes"
        : "Canais de atendimento";

  return (
    <aside className="side-panel-backdrop" onClick={onClose}>
      <div
        className="side-panel utility-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Painel utilitário"
      >
        <div className="side-panel-header">
          <div>
            <span className="panel-kicker">{panelKicker}</span>
            <h2>{panelTitle}</h2>
          </div>

          <button className="close-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {activePanel === "coupons" ? (
          <div className="utility-list">
            {coupons.map((coupon) => (
              <article key={coupon.code} className="utility-card">
                <strong>{coupon.code}</strong>
                <p>{coupon.description}</p>
              </article>
            ))}
          </div>
        ) : null}

        {activePanel === "orders" ? (
          <div className="utility-list">
            {orders.map((order) => (
              <article key={order.id} className="utility-card">
                <strong>{order.product}</strong>
                <p>{order.id}</p>
                <span>{order.status}</span>
              </article>
            ))}
          </div>
        ) : null}

        {activePanel === "contact" ? (
          <div className="utility-list">
            <article className="utility-card">
              <strong>WhatsApp</strong>
              <p>(41) 99999-9999</p>
            </article>

            <article className="utility-card">
              <strong>E-mail</strong>
              <p>contato@forma3d.store</p>
            </article>
          </div>
        ) : null}
      </div>
    </aside>
  );
}