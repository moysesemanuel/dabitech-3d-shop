import type { Order } from "../../types";
import { formatCurrency } from "../../lib/currency";

type UtilityPanelType = "coupons" | "orders" | "contact";

interface Coupon {
  code: string;
  description: string;
}

interface UtilityPanelProps {
  activePanel: UtilityPanelType;
  coupons: Coupon[];
  orders: Order[];
  isLoadingOrders?: boolean;
  ordersError?: string | null;
  onRefreshOrders?: () => void | Promise<void>;
  onClose: () => void;
}

function formatOrderStatus(status: Order["status"]) {
  const labels: Record<Order["status"], string> = {
    pending_payment: "Aguardando pagamento",
    paid: "Pago",
    in_production: "Em produção",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado"
  };

  return labels[status];
}

export function UtilityPanel({
  activePanel,
  coupons,
  orders,
  isLoadingOrders = false,
  ordersError = null,
  onRefreshOrders,
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
            <button
              className="ghost-action"
              type="button"
              onClick={onRefreshOrders}
              disabled={isLoadingOrders}
            >
              {isLoadingOrders ? "Atualizando..." : "Atualizar compras"}
            </button>

            {ordersError ? <p className="admin-upload-error">{ordersError}</p> : null}

            {!isLoadingOrders && orders.length === 0 ? (
              <article className="utility-card">
                <strong>Nenhuma compra encontrada.</strong>
                <p>Quando você finalizar um pedido, ele aparecerá aqui.</p>
              </article>
            ) : null}

            {orders.map((order) => (
              <article key={order.id} className="utility-card">
                <strong>{order.id}</strong>
                <p>{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p>
                <span>{formatOrderStatus(order.status)}</span>
                <span>{formatCurrency(order.totalInCents)}</span>
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
