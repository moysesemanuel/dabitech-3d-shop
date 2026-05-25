import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import type { HeroSlide } from "../home/HeroCarousel";

interface AdminSlidesEditorProps {
  slides: HeroSlide[];
  adminUploadError?: string | null;
  onUpdateSlide: (slideId: string, field: keyof HeroSlide, value: string) => void;
  onSlideImagesInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onSlideImagesDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onSlideImageInput: (slideId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onSlideImageDrop: (slideId: string, event: DragEvent<HTMLLabelElement>) => void;
  onRemoveSlide: (slideId: string) => void;
  onSaveSlides: () => void;
  onCancelSlides: () => void;
}

const disconnectedBannerSections = [
  {
    title: "Banner Tarja",
    action: "Adicionar banner tarja",
    empty: "Ainda não existe nenhum banner tarja cadastrado."
  },
  {
    title: "Full Banner",
    action: "Adicionar full banner",
    empty: "Ainda não existe nenhum full banner cadastrado."
  },
  {
    title: "Mini Banner",
    action: "Adicionar mini banner",
    empty: "Ainda não existe nenhum mini banner cadastrado."
  }
];

const bannerPositions = [
  { label: "FULL BANNER", className: "banner-slot-full", size: "1260 x 420 px" },
  { label: "", className: "banner-slot-mini-empty", size: "390 x 170 px", hideHelp: true },
  { label: "MINI BANNER", className: "banner-slot-mini", size: "390 x 170 px", hideHelp: true },
  { label: "", className: "banner-slot-mini-empty", size: "390 x 170 px" },
  { label: "BANNER TARJA", className: "banner-slot-tarja", size: "1260 x 120 px" },
  { label: "BANNER VITRINE", className: "banner-slot-vitrine is-active", size: "1260 x 420 px" }
];

function BannerPositionPreview() {
  return (
    <div className="banner-position-map">
      <strong>Posição do banner</strong>
      <p>
        Na nova estrutura o tamanho dos banners varia de acordo com a disposição escolhida.
        <button type="button"> clique aqui </button>
        para saber mais detalhes sobre as dimensões.
      </p>

      <div className="banner-position-grid">
        {bannerPositions.map((position) => (
          <div key={`${position.className}-${position.label}`} className={position.className}>
            {position.label ? <span>{position.label}</span> : null}
            {!position.hideHelp ? (
              <button
                className="banner-slot-help"
                type="button"
                aria-label={`Tamanho recomendado ${position.size}`}
              >
                ?
                <span>Largura recomendada: {position.size.split(" x ")[0]}. Altura recomendada: {position.size.split(" x ")[1]}.</span>
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSlidesEditor({
  slides,
  onUpdateSlide,
  onSlideImagesInput,
  onSlideImagesDrop,
  onSlideImageInput,
  onSlideImageDrop,
  onRemoveSlide,
  onSaveSlides,
  onCancelSlides
}: AdminSlidesEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [helpIsOpen, setHelpIsOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  const editingSlide = slides.find((slide) => slide.id === editingSlideId) ?? null;

  function showDisconnectedNotice(sectionTitle: string) {
    setBannerNotice(
      `${sectionTitle} ainda não está conectado à vitrine. Use Banner Vitrine para controlar o carrossel principal.`
    );
  }

  if (editingSlide) {
    return (
      <div className="admin-list banner-editor-page">
        <div className="banner-editor-topbar">
          <button
            className="product-form-back"
            type="button"
            onClick={() => setEditingSlideId(null)}
          >
            &lt; Banners / Editar banner
          </button>
          <button
            className="banner-help-button"
            type="button"
            onClick={() => setHelpIsOpen((current) => !current)}
          >
            ? Obtenha ajuda sobre
          </button>
        </div>

        {helpIsOpen ? (
          <div className="banner-manager-notice">
            O Banner Vitrine é exibido no carrossel principal da página inicial.
            Use imagem em 1260 x 420 px para evitar cortes.
          </div>
        ) : null}

        <section className="banner-edit-card">
          <header className="banner-edit-card-header">
            <h3>Editando banner</h3>
          </header>

          <div className="banner-edit-grid">
            <div className="banner-edit-fields">
              <label className="product-form-switch">
                <span>Banner ativo?</span>
                <span className="form-toggle is-on" aria-hidden="true">
                  <span />
                </span>
              </label>

              <label>
                <span>Nome do banner *</span>
                <input
                  value={editingSlide.title}
                  onChange={(event) =>
                    onUpdateSlide(editingSlide.id, "title", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Posição do banner *</span>
                <select value="vitrine" onChange={() => undefined}>
                  <option value="vitrine">Banner vitrine</option>
                </select>
              </label>

              <label>
                <span>Página de publicação *</span>
                <select
                  value={editingSlide.category}
                  onChange={(event) =>
                    onUpdateSlide(editingSlide.id, "category", event.target.value)
                  }
                >
                  <option value="all">Página inicial</option>
                  <option value="decor">Decoração</option>
                  <option value="gaming">Gaming</option>
                  <option value="fashion">Fashion</option>
                  <option value="workspace">Workspace</option>
                </select>
              </label>

              <label>
                <span>Link do banner</span>
                <input
                  value={editingSlide.cta}
                  onChange={(event) =>
                    onUpdateSlide(editingSlide.id, "cta", event.target.value)
                  }
                  placeholder="Texto ou destino do clique"
                />
              </label>

              <label>
                <span>Título do banner</span>
                <textarea
                  value={editingSlide.description}
                  onChange={(event) =>
                    onUpdateSlide(editingSlide.id, "description", event.target.value)
                  }
                />
              </label>

              <div className="banner-schedule-grid">
                <label>
                  <span>Data de início do agendamento</span>
                  <input type="datetime-local" />
                </label>
                <label>
                  <span>Data final do agendamento</span>
                  <input type="datetime-local" />
                </label>
              </div>
            </div>

            <aside className="banner-position-preview">
              <BannerPositionPreview />
            </aside>
          </div>
        </section>

        <section className="banner-edit-card">
          <header className="banner-edit-card-header">
            <h3>Imagem do banner</h3>
          </header>
          <label
            className="banner-image-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onSlideImageDrop(editingSlide.id, event)}
          >
            {editingSlide.imageUrl ? (
              <img src={editingSlide.imageUrl} alt={editingSlide.title} />
            ) : (
              <div>
                <strong>Arraste e solte a imagem do banner aqui</strong>
                <small>Máximo de 1 imagem. Tamanho recomendado 1260 x 420 px.</small>
              </div>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(event) => onSlideImageInput(editingSlide.id, event)}
            />
          </label>
        </section>

        <section className="banner-edit-card">
          <header className="banner-edit-card-header">
            <h3>Imagem do banner para celular</h3>
            <p>Opcional. Caso adicionada, será usada em uma futura versão mobile dedicada.</p>
          </header>
          <label className="banner-image-dropzone is-disabled">
            <div>
              <strong>Arraste e solte a imagem do banner para celular aqui</strong>
              <small>Campo visual reservado para expansão futura.</small>
            </div>
          </label>
        </section>

        <div className="admin-editor-actions banner-editor-actions">
          <button className="ghost-action" type="button" onClick={() => setEditingSlideId(null)}>
            Cancelar
          </button>
          <button
            className="admin-primary-action"
            type="button"
            onClick={() => {
              onSaveSlides();
              setEditingSlideId(null);
            }}
          >
            Salvar banner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list banner-manager">
      <div className="banner-manager-heading">
        <h2>Banners</h2>
        <button
          className="banner-help-button"
          type="button"
          onClick={() => setHelpIsOpen((current) => !current)}
        >
          ? Como incluir banners da loja
        </button>
      </div>

      {helpIsOpen ? (
        <div className="banner-manager-notice">
          Use o bloco Banner Vitrine para adicionar imagens ao carrossel da página inicial.
          Envie imagens em 1260 x 420 px e clique em Salvar para publicar.
        </div>
      ) : null}

      {bannerNotice ? <div className="banner-manager-notice">{bannerNotice}</div> : null}

      <section className="banner-section-card">
        <header className="banner-section-header">
          <h3>Banner Vitrine</h3>
          <button
            className="banner-add-button"
            type="button"
            onClick={() => {
              setBannerNotice(null);
              fileInputRef.current?.click();
            }}
          >
            + Adicionar banner vitrine
          </button>
        </header>

        <div className="banner-table">
          <div className="banner-table-head">
            <span />
            <strong>Nome do banner</strong>
            <strong>Data início agendamento</strong>
            <strong>Data fim agendamento</strong>
            <strong>Status</strong>
          </div>

          {slides.length > 0 ? (
            <div className="banner-table-body">
              {slides.map((slide, index) => (
                <div key={slide.id} className="banner-table-row">
                  <span className="banner-check" />
                  <div className="banner-name-cell">
                    {slide.imageUrl ? <img src={slide.imageUrl} alt={`Banner ${index + 1}`} /> : null}
                    <strong>{slide.title || `Banner vitrine ${index + 1}`}</strong>
                  </div>
                  <span>Sem agendamento</span>
                  <span>Sem agendamento</span>
                  <div className="banner-row-actions">
                    <button
                      className="ghost-action"
                      type="button"
                      onClick={() => setEditingSlideId(slide.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="ghost-action"
                      type="button"
                      onClick={() => onRemoveSlide(slide.id)}
                      disabled={slides.length <= 1}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="banner-table-empty">Ainda não existe nenhum banner vitrine cadastrado.</div>
          )}
        </div>

        <label
          className="admin-upload admin-upload-banner"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onSlideImagesDrop}
        >
          <div className="admin-upload-placeholder">
            <strong>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
              </svg>
              <span>Selecionar</span> ou arrastar os arquivos aqui
            </strong>
            <small>Envie até 12 imagens JPG, JPEG, PNG ou WEBP com 1260 x 420 px e até 10 MB.</small>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp"
            onChange={onSlideImagesInput}
          />
        </label>
      </section>

      {disconnectedBannerSections.map((section) => (
        <section key={section.title} className="banner-section-card">
          <header className="banner-section-header">
            <h3>{section.title}</h3>
            <button
              className="banner-add-button"
              type="button"
              onClick={() => showDisconnectedNotice(section.title)}
            >
              + {section.action}
            </button>
          </header>
          <div className="banner-table">
            <div className="banner-table-head">
              <span />
              <strong>Nome do banner</strong>
              <strong>Data início agendamento</strong>
              <strong>Data fim agendamento</strong>
              <strong>Status</strong>
            </div>
            <div className="banner-table-empty">{section.empty}</div>
          </div>
        </section>
      ))}

      <div className="admin-editor-actions">
        <button className="ghost-action" type="button" onClick={onCancelSlides}>
          Cancelar
        </button>
        <button className="admin-primary-action" type="button" onClick={onSaveSlides}>
          Salvar
        </button>
      </div>
    </div>
  );
}
