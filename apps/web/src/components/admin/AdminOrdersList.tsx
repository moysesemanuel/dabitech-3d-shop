import { useState } from "react";

import type { Order } from "../../types";
import { formatCurrency } from "../../lib/currency";

interface AdminOrdersListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void | Promise<void>;
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatPaymentMethod(paymentMethod: Order["paymentMethod"]) {
  return paymentMethod === "whatsapp" ? "WhatsApp" : "Pix";
}

function formatAddress(order: Order) {
  return [
    order.address.label,
    order.address.street,
    order.address.district,
    `${order.address.city}/${order.address.state}`,
    order.address.zipCode
  ]
    .filter(Boolean)
    .join(" - ");
}

export function AdminOrdersList({
  orders,
  isLoading,
  error,
  onRefresh,
  onUpdateStatus
}: AdminOrdersListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesQuery = normalizedQuery
      ? [
        order.id,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.address.city,
        order.address.state,
        ...order.items.map((item) => item.name)
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
      : true;

    return matchesStatus && matchesQuery;
  });

  if (selectedOrder) {
    return (
      <div className="admin-list admin-order-detail">
        <div className="admin-detail-topbar">
          <button
            className="admin-back-button"
            type="button"
            onClick={() => setSelectedOrderId(null)}
          >
            <span aria-hidden="true">←</span>
            <span>Voltar para pedidos</span>
          </button>
          <button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        <section className="admin-order-detail-hero">
          <div>
            <span className="panel-kicker">Pedido</span>
            <h2>{selectedOrder.id}</h2>
            <p>Criado em {formatOrderDate(selectedOrder.createdAt)}</p>
          </div>
          <label>
            <span>Status do pedido</span>
            <select
              className="admin-order-status-select"
              value={selectedOrder.status}
              onChange={(event) =>
                onUpdateStatus(selectedOrder.id, event.target.value as Order["status"])
              }
            >
              <option value="pending_payment">Aguardando pagamento</option>
              <option value="paid">Pago</option>
              <option value="in_production">Em produção</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>
        </section>

        <div className="admin-order-detail-grid">
          <section className="admin-order-detail-card">
            <span className="panel-kicker">Cliente</span>
            <strong>{selectedOrder.customer.name}</strong>
            <p>{selectedOrder.customer.email}</p>
            <p>{selectedOrder.customer.phone}</p>
          </section>

          <section className="admin-order-detail-card">
            <span className="panel-kicker">Entrega</span>
            <strong>{selectedOrder.address.label}</strong>
            <p>{formatAddress(selectedOrder)}</p>
          </section>

          <section className="admin-order-detail-card">
            <span className="panel-kicker">Pagamento</span>
            <strong>{formatPaymentMethod(selectedOrder.paymentMethod)}</strong>
            <p>Status financeiro controlado manualmente até integrar gateway.</p>
          </section>
        </div>

        <section className="admin-order-detail-card">
          <div className="admin-order-detail-section-header">
            <div>
              <span className="panel-kicker">Itens</span>
              <h3>Produtos do pedido</h3>
            </div>
            <strong>{formatCurrency(selectedOrder.totalInCents)}</strong>
          </div>

          <div className="admin-order-detail-items">
            {selectedOrder.items.map((item) => (
              <article key={`${selectedOrder.id}-${item.productId}`}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} unidade(s) x {formatCurrency(item.priceInCents)}</span>
                </div>
                <strong>{formatCurrency(item.subtotalInCents)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-order-detail-card">
          <span className="panel-kicker">Próximas ações</span>
          <div className="admin-order-timeline">
            <span>1. Confirmar pagamento manualmente.</span>
            <span>2. Mover para em produção.</span>
            <span>3. Atualizar para enviado quando despachar.</span>
            <span>4. Marcar como entregue ao concluir.</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-list admin-orders-list">
      <div className="admin-toolbar">
        <div>
          <span className="panel-kicker">Pedidos</span>
          <h2>Pedidos recebidos</h2>
        </div>
        <button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div className="admin-orders-filters">
        <label>
          <span>Buscar pedido</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ID, cliente, e-mail, telefone ou produto"
          />
        </label>
        <label>
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as Order["status"] | "all")}
          >
            <option value="all">Todos</option>
            <option value="pending_payment">Aguardando pagamento</option>
            <option value="paid">Pago</option>
            <option value="in_production">Em produção</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
      </div>

      {error ? <p className="admin-upload-error">{error}</p> : null}

      {isLoading && orders.length === 0 ? (
        <div className="empty-state compact">
          <strong>Carregando pedidos...</strong>
          <p>Buscando pedidos salvos no backend.</p>
        </div>
      ) : null}

      {!isLoading && orders.length === 0 ? (
        <div className="empty-state compact">
          <strong>Nenhum pedido encontrado.</strong>
          <p>Os pedidos criados no checkout aparecerão aqui.</p>
        </div>
      ) : null}

      {orders.length > 0 && filteredOrders.length === 0 ? (
        <div className="empty-state compact">
          <strong>Nenhum pedido encontrado para este filtro.</strong>
          <p>Ajuste a busca ou selecione outro status.</p>
        </div>
      ) : null}

      {filteredOrders.length > 0 ? (
        <div className="admin-orders-table">
          <div className="admin-orders-head">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Status</span>
            <span>Pagamento</span>
            <span>Total</span>
          </div>

          {filteredOrders.map((order) => (
            <article key={order.id} className="admin-order-row">
              <div>
                <strong>{order.id}</strong>
                <span>{formatOrderDate(order.createdAt)}</span>
              </div>
              <div>
                <strong>{order.customer.name}</strong>
                <span>{order.customer.email}</span>
              </div>
              <div>
                <select
                  className="admin-order-status-select"
                  value={order.status}
                  onChange={(event) =>
                    onUpdateStatus(order.id, event.target.value as Order["status"])
                  }
                >
                  <option value="pending_payment">Aguardando pagamento</option>
                  <option value="paid">Pago</option>
                  <option value="in_production">Em produção</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <span>{order.items.length} item(ns)</span>
              </div>
              <div>
                <strong>{formatPaymentMethod(order.paymentMethod)}</strong>
                <span>{order.customer.phone}</span>
              </div>
              <div>
                <strong>{formatCurrency(order.totalInCents)}</strong>
                <span>{order.address.city}/{order.address.state}</span>
              </div>

              <div className="admin-order-items">
                {order.items.map((item) => (
                  <span key={`${order.id}-${item.productId}`}>
                    {item.quantity}x {item.name} - {formatCurrency(item.subtotalInCents)}
                  </span>
                ))}
              </div>

              <div className="admin-order-row-actions">
                <button
                  className="ghost-action"
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  Ver detalhes
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
