export function StoreInfoSection() {
  return (
    <section className="product-section-card">
      <h2>Informações sobre a loja</h2>

      <div className="store-info-grid">
        <div>
          <strong>Atendimento</strong>
          <p>Retorno rápido para dúvidas sobre materiais, acabamento e personalização.</p>
        </div>

        <div>
          <strong>Produção</strong>
          <p>Lotes curtos, conferência manual e foco em peças com boa apresentação.</p>
        </div>

        <div>
          <strong>Envio</strong>
          <p>Peças embaladas com proteção reforçada para transporte nacional.</p>
        </div>

        <div>
          <strong>Garantia</strong>
          <p>Suporte pós-venda para problemas de transporte ou defeitos de fabricação.</p>
        </div>
      </div>
    </section>
  );
}