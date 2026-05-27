import { useEffect, useState, type FormEvent } from "react";

import type {
  AuthUser,
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

function getPaymentMethodLabel(paymentMethod: "pix" | "whatsapp") {
  return paymentMethod === "whatsapp" ? "Combinar pelo WhatsApp" : "Pix manual";
}

function getDeliveryMethodLabel(deliveryMethod: "delivery" | "pickup" | "combine") {
  const labels = {
    delivery: "Entrega no endereço",
    pickup: "Retirada combinada",
    combine: "Combinar entrega"
  };

  return labels[deliveryMethod];
}

interface CartPanelProps {
  cartCount: number;
  cartProducts: CartProduct[];
  cartTotalInCents: number;
  selectedAddress: CheckoutAddress | null;
  authUser: AuthUser | null;
  isSubmittingOrder: boolean;
  completedOrder: CreateOrderResponse | null;
  onClose: () => void;
  onRequestAddress: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onSubmitOrder: (payload: {
    customer: CheckoutCustomer;
    address: CheckoutAddress;
    deliveryMethod: "delivery" | "pickup" | "combine";
    paymentMethod: "pix" | "whatsapp";
  }) => Promise<void>;
}

export function CartPanel({
  cartCount,
  cartProducts,
  cartTotalInCents,
  selectedAddress,
  authUser,
  isSubmittingOrder,
  completedOrder,
  onClose,
  onRequestAddress,
  onUpdateQuantity,
  onSubmitOrder
}: CartPanelProps) {
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "whatsapp">("pix");
  const [deliveryMethod, setDeliveryMethod] =
    useState<"delivery" | "pickup" | "combine">("combine");
  const [checkoutAddress, setCheckoutAddress] = useState<CheckoutAddress>({
    label: "",
    street: "",
    district: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const addressIsComplete = [
    checkoutAddress.label,
    checkoutAddress.street,
    checkoutAddress.district,
    checkoutAddress.city,
    checkoutAddress.state,
    checkoutAddress.zipCode
  ].every((value) => value.trim().length > 0);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setCustomer((current) => ({
      ...current,
      name: current.name || authUser.name,
      email: current.email || authUser.email
    }));
  }, [authUser]);

  useEffect(() => {
    if (!selectedAddress) {
      return;
    }

    setCheckoutAddress(selectedAddress);
  }, [selectedAddress]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmitOrder({
      customer,
      address: checkoutAddress,
      deliveryMethod,
      paymentMethod
    });
  }

  return (
    <main className="cart-page">
      <section className="cart-page-shell">
        <div className="cart-page-header">
          <div>
            <span className="panel-kicker">Seu carrinho</span>
            <h2>{cartCount} item(ns)</h2>
          </div>

          <button className="close-button" type="button" onClick={onClose}>
            Continuar comprando
          </button>
        </div>

        {completedOrder ? (
          <div className="order-confirmation">
            <span className="panel-kicker">Pedido criado</span>
            <h3>{completedOrder.order.id}</h3>
            <p>{completedOrder.instructions}</p>
            <div className="checkout-address">
              <span>Entrega</span>
              <strong>
                {completedOrder.order.address.label} - {completedOrder.order.address.street},{" "}
                {completedOrder.order.address.city}/{completedOrder.order.address.state}
              </strong>
              <span>{getDeliveryMethodLabel(completedOrder.order.deliveryMethod)}</span>
            </div>
            <div className="admin-order-items">
              {completedOrder.order.items.map((item) => (
                <span key={`${completedOrder.order.id}-${item.productId}`}>
                  {item.quantity}x {item.name} - {formatCurrency(item.subtotalInCents)}
                </span>
              ))}
            </div>
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
          <form className="checkout-layout" onSubmit={handleSubmit}>
            <div className="checkout-main">
              <section className="checkout-card">
                <div className="checkout-card-header">
                  <span>1</span>
                  <div>
                    <h3>Produtos</h3>
                    <p>Revise os itens antes de finalizar o pedido.</p>
                  </div>
                </div>

                <div className="cart-items">
                  {cartProducts.map(({ product, quantity }) => (
                    <article key={product.id} className="cart-row">
                      <div className="cart-row-copy">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : null}
                        <div>
                          <strong>{product.name}</strong>
                          <p>{formatCurrency(product.priceInCents)}</p>
                        </div>
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
              </section>

              <section className="checkout-card">
                <div className="checkout-card-header">
                  <span>2</span>
                  <div>
                    <h3>Entrega</h3>
                    <p>Escolha onde receber seus produtos.</p>
                  </div>
                </div>
                <div className="checkout-address">
                  <strong>
                    {addressIsComplete
                      ? `${checkoutAddress.label} - ${checkoutAddress.street}, ${checkoutAddress.city}/${checkoutAddress.state}`
                      : "Informe um endereço de entrega"}
                  </strong>
                  <button className="ghost-action" type="button" onClick={onRequestAddress}>
                    Usar endereços salvos
                  </button>
                </div>
                <div className="checkout-address-grid">
                  <label>
                    <span>Apelido</span>
                    <input
                      value={checkoutAddress.label}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({ ...current, label: event.target.value }))
                      }
                      placeholder="Casa, trabalho..."
                      required
                    />
                  </label>
                  <label>
                    <span>Rua e número</span>
                    <input
                      value={checkoutAddress.street}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({ ...current, street: event.target.value }))
                      }
                      placeholder="Rua, avenida, número"
                      required
                    />
                  </label>
                  <label>
                    <span>Bairro</span>
                    <input
                      value={checkoutAddress.district}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({ ...current, district: event.target.value }))
                      }
                      placeholder="Bairro"
                      required
                    />
                  </label>
                  <label>
                    <span>Cidade</span>
                    <input
                      value={checkoutAddress.city}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({ ...current, city: event.target.value }))
                      }
                      placeholder="Cidade"
                      required
                    />
                  </label>
                  <label>
                    <span>UF</span>
                    <input
                      value={checkoutAddress.state}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({
                          ...current,
                          state: event.target.value.toUpperCase().slice(0, 2)
                        }))
                      }
                      placeholder="PR"
                      required
                    />
                  </label>
                  <label>
                    <span>CEP</span>
                    <input
                      value={checkoutAddress.zipCode}
                      onChange={(event) =>
                        setCheckoutAddress((current) => ({ ...current, zipCode: event.target.value }))
                      }
                      placeholder="00000-000"
                      required
                    />
                  </label>
                </div>
                <label>
                  <span>Tipo de entrega</span>
                  <select
                    value={deliveryMethod}
                    onChange={(event) =>
                      setDeliveryMethod(event.target.value as "delivery" | "pickup" | "combine")
                    }
                  >
                    <option value="combine">Combinar entrega</option>
                    <option value="delivery">Entrega no endereço</option>
                    <option value="pickup">Retirada combinada</option>
                  </select>
                </label>
              </section>

              <section className="checkout-card">
                <div className="checkout-card-header">
                  <span>3</span>
                  <div>
                    <h3>Dados de contato</h3>
                    <p>Usaremos estes dados para confirmar pagamento e entrega.</p>
                  </div>
                </div>
                <div className="checkout-form-grid">
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
                </div>
              </section>

              <section className="checkout-card">
                <div className="checkout-card-header">
                  <span>4</span>
                  <div>
                    <h3>Pagamento</h3>
                    <p>Escolha como quer concluir a compra.</p>
                  </div>
                </div>
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
              </section>
            </div>

            <aside className="checkout-summary">
              <span className="panel-kicker">Resumo</span>
              <h3>Seu pedido</h3>

              <div className="checkout-summary-lines">
                <div>
                  <span>Produtos ({cartCount})</span>
                  <strong>{formatCurrency(cartTotalInCents)}</strong>
                </div>
                <div>
                  <span>Entrega</span>
                  <strong>{getDeliveryMethodLabel(deliveryMethod)}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>{getPaymentMethodLabel(paymentMethod)}</strong>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <strong>{formatCurrency(cartTotalInCents)}</strong>
              </div>

              <button type="submit" disabled={isSubmittingOrder || !addressIsComplete}>
                {isSubmittingOrder ? "Finalizando..." : "Finalizar pedido"}
              </button>

              {!addressIsComplete ? (
                <small>Informe o endereço completo para liberar a finalização.</small>
              ) : (
                <small>Você receberá as instruções de pagamento após criar o pedido.</small>
              )}
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}
