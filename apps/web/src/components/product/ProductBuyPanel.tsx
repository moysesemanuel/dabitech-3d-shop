interface ProductBuyPanelProps {
  productId: string;
  isFavorite: boolean;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
}

export function ProductBuyPanel({
  productId,
  isFavorite,
  onAddToCart,
  onToggleFavorite
}: ProductBuyPanelProps) {
  return (
    <aside className="product-buy-panel">
      <span className="product-buy-badge">Frete grátis acima de R$ 19</span>

      <strong className="product-buy-title">
        Chegará grátis entre quinta-feira e sexta-feira
      </strong>

      <p>Retire grátis a partir de quarta-feira em uma agência parceira.</p>
      <p>Estoque disponível para envio imediato.</p>

      <div className="product-buy-actions">
        <button type="button" onClick={() => onAddToCart(productId)}>
          Comprar agora
        </button>

        <button
          className="ghost-action"
          type="button"
          onClick={() => onAddToCart(productId)}
        >
          Adicionar ao carrinho
        </button>

        <button
          className={isFavorite ? "ghost-action active-ghost" : "ghost-action"}
          type="button"
          onClick={() => onToggleFavorite(productId)}
        >
          {isFavorite ? "Remover dos favoritos" : "Adicionar a uma lista"}
        </button>
      </div>

      <div className="buy-panel-meta">
        <div>
          <strong>Loja oficial Forma 3D</strong>
          <p>+1000 vendas</p>
        </div>

        <div>
          <strong>Compra garantida</strong>
          <p>Receba o produto que está esperando ou devolvemos o dinheiro.</p>
        </div>

        <div>
          <strong>Pagamento</strong>
          <p>Pix, cartão, boleto e carteiras digitais.</p>
        </div>
      </div>
    </aside>
  );
}