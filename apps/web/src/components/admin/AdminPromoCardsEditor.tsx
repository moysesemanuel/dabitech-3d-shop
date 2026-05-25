import type { PromoCard } from "../home/PromoStrip";

interface AdminPromoCardsEditorProps {
  promoCards: PromoCard[];
  onUpdatePromoCard: (promoId: string, field: keyof PromoCard, value: string) => void;
}

export function AdminPromoCardsEditor({
  promoCards,
  onUpdatePromoCard
}: AdminPromoCardsEditorProps) {
  return (
    <div className="admin-list">
      {promoCards.map((promo) => (
        <article key={promo.id} className="admin-card">
          <strong>{promo.id}</strong>
          <label>
            <span>Tag</span>
            <input
              value={promo.tag}
              onChange={(event) => onUpdatePromoCard(promo.id, "tag", event.target.value)}
            />
          </label>
          <label>
            <span>Título</span>
            <input
              value={promo.title}
              onChange={(event) => onUpdatePromoCard(promo.id, "title", event.target.value)}
            />
          </label>
          <label>
            <span>Descrição</span>
            <textarea
              value={promo.description}
              onChange={(event) =>
                onUpdatePromoCard(promo.id, "description", event.target.value)
              }
            />
          </label>
        </article>
      ))}
    </div>
  );
}
