export function ProductQuestions() {
  return (
    <section className="product-section-card">
      <h2>Perguntas</h2>

      <div className="qa-box">
        <input type="text" placeholder="Digite sua pergunta..." />
        <button type="button">Perguntar</button>
      </div>

      <div className="qa-list">
        <article>
          <strong>Pergunta:</strong>
          <p>Esse item pode ser feito em outra cor?</p>

          <strong>Resposta:</strong>
          <p>Sim, a base do catálogo já comporta personalização de cor sob consulta.</p>
        </article>

        <article>
          <strong>Pergunta:</strong>
          <p>Vocês produzem sob encomenda?</p>

          <strong>Resposta:</strong>
          <p>Produzimos em lotes curtos e também avaliamos pedidos específicos.</p>
        </article>
      </div>
    </section>
  );
}