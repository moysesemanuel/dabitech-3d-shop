interface ProductFeaturesProps {
  tags: string[];
}

export function ProductFeatures({ tags }: ProductFeaturesProps) {
  return (
    <section className="product-section-card">
      <h2>Características do anúncio</h2>

      <div className="feature-grid">
        {tags.map((tag) => (
          <article key={tag} className="feature-card">
            <strong>{tag}</strong>
            <p>Aplicação alinhada com a proposta visual e com o tipo de peça.</p>
          </article>
        ))}
      </div>
    </section>
  );
}