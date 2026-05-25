import { useState, type FormEvent } from "react";

import type {
  CheckoutAddress,
  CheckoutCustomer,
  CreateOrderResponse,
  Product
} from "../../types";
import { formatCurrency } from "../../lib/currency";

interface CartProduct {
  product: Product;
  quantity: number;
}

interface CartPanelProps {
  cartCount: number;
  cartProducts: CartProduct[];
  cartTotalInCents: number;
  selectedAddress: CheckoutAddress | null;
  isSubmittingOrder: boolean;
  completedOrder: CreateOrderResponse | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onSubmitOrder: (payload: {
    customer: CheckoutCustomer;
    paymentMethod: "pix" | "whatsapp";
  }) => Promise<void>;
}

export function CartPanel({
  cartCount,
  cartProducts,
  cartTotalInCents,
  selectedAddress,
  isSubmittingOrder,
  completedOrder,
  onClose,
  onUpdateQuantity,
  onSubmitOrder
}: CartPanelProps) {
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "whatsapp">("pix");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmitOrder({
      customer,
      paymentMethod
    });
  }

  return (
    <aside className="side-panel-backdrop" onClick={onClose}>
      <div
        className="side-panel cart-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
      >
        <div className="side-panel-header">
          <div>
            <span className="panel-kicker">Seu carrinho</span>
            <h2>{cartCount} item(ns)</h2>
          </div>

          <button className="close-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {completedOrder ? (
          <div className="order-confirmation">
            <span className="panel-kicker">Pedido criado</span>
            <h3>{completedOrder.order.id}</h3>
            <p>{completedOrder.instructions}</p>
            <div className="cart-total">
              <span>Total do pedido</span>
              <strong>{formatCurrency(completedOrder.order.totalInCents)}</strong>
            </div>
            <small>
              Status: aguardando pagamento. Use esse número no comprovante ou no atendimento.
            </small>
          </div>
        ) : cartProducts.length === 0 ? (
          <div className="empty-state compact">
            <strong>Seu carrinho está vazio.</strong>
            <p>Adicione itens do catálogo para iniciar a compra.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartProducts.map(({ product, quantity }) => (
                <article key={product.id} className="cart-row">
                  <div>
                    <strong>{product.name}</strong>
                    <p>{formatCurrency(product.priceInCents)}</p>
                  </div>

                  <div className="cart-controls">
                    <button
                      className="qty-button"
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    >
                      -
                    </button>

                    <span>{quantity}</span>

                    <button
                      className="qty-button"
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatCurrency(cartTotalInCents)}</strong>
              </div>

              <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="checkout-address">
                  <span>Entrega</span>
                  <strong>
                    {selectedAddress
                      ? `${selectedAddress.label} - ${selectedAddress.street}, ${selectedAddress.city}/${selectedAddress.state}`
                      : "Selecione um endereço no topo da página"}
                  </strong>
                </div>

                <label>
                  <span>Nome completo</span>
                  <input
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Seu nome"
                    required
                  />
                </label>

                <label>
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      setCustomer((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="voce@email.com"
                    required
                  />
                </label>

                <label>
                  <span>WhatsApp</span>
                  <input
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="(00) 00000-0000"
                    required
                  />
                </label>

                <label>
                  <span>Pagamento</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value === "whatsapp" ? "whatsapp" : "pix")
                    }
                  >
                    <option value="pix">Pix manual</option>
                    <option value="whatsapp">Combinar pelo WhatsApp</option>
                  </select>
                </label>

                <button type="submit" disabled={isSubmittingOrder || !selectedAddress}>
                  {isSubmittingOrder ? "Finalizando..." : "Finalizar pedido"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
