import type { CSSProperties } from "react";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  category: string;
  accent: string;
  imageUrl?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  activeSlide: number;
  onPreviousSlide: () => void;
  onNextSlide: () => void;
  onActivateSlide: (index: number) => void;
  onSlideAction: (category: string) => void;
}

export function HeroCarousel({
  slides,
  activeSlide,
  onPreviousSlide,
  onNextSlide,
  onActivateSlide,
  onSlideAction
}: HeroCarouselProps) {
  return (
    <section className="hero-carousel" aria-label="Destaques da loja">
      <button
        className="hero-arrow hero-arrow-left"
        type="button"
        aria-label="Banner anterior"
        onClick={onPreviousSlide}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m14.5 5-7 7 7 7" />
        </svg>
      </button>

      <div
        className="hero-track"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <button
            key={slide.id}
            className={slide.imageUrl ? "hero-slide hero-slide-has-image" : "hero-slide"}
            type="button"
            style={{ "--slide-accent": slide.accent } as CSSProperties}
            onClick={() => onSlideAction(slide.category)}
          >
            {slide.imageUrl ? (
              <img
                className="hero-slide-image"
                src={slide.imageUrl}
                alt={slide.title}
              />
            ) : null}

            {!slide.imageUrl ? <div className="hero-slide-overlay" /> : null}

            {!slide.imageUrl ? (
              <div className="hero-slide-content">
                <span>{slide.eyebrow}</span>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                <span className="hero-slide-cta">{slide.cta}</span>
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <button
        className="hero-arrow hero-arrow-right"
        type="button"
        aria-label="Próximo banner"
        onClick={onNextSlide}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9.5 5 7 7-7 7" />
        </svg>
      </button>

      <div className="hero-dots" role="tablist" aria-label="Selecionar banner">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={index === activeSlide ? "hero-dot active" : "hero-dot"}
            type="button"
            role="tab"
            aria-selected={index === activeSlide}
            aria-label={`Ir para banner ${index + 1}`}
            onClick={() => onActivateSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
