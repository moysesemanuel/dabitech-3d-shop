export interface PromoCard {
  id: string;
  tag: string;
  title: string;
  description: string;
}

interface PromoStripProps {
  promoCards: PromoCard[];
}

export function PromoStrip({ promoCards }: PromoStripProps) {
  return (
    <section className="promo-strip">
      {promoCards.map((promo) => (
        <article key={promo.id} className="promo-card">
          <span className="promo-tag">{promo.tag}</span>
          <strong>{promo.title}</strong>
          <p>{promo.description}</p>
        </article>
      ))}
    </section>
  );
}