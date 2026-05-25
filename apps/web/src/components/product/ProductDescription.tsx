interface ProductDescriptionProps {
  description: string;
  categoryLabel: string;
}

export function ProductDescription({
  description,
  categoryLabel
}: ProductDescriptionProps) {
  return (
    <section className="product-section-card">
      <h2>Descrição</h2>

      <div className="product-description-block">
        <p>{description}</p>

        <p>
          Desenvolvido para quem procura uma peça com presença visual mais forte e
          acabamento consistente. A combinação de material, proporção e textura foi pensada
          para uso em ambientes de {categoryLabel.toLowerCase()}.
        </p>
      </div>
    </section>
  );
}