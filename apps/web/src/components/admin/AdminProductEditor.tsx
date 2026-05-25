import type { ChangeEvent, DragEvent } from "react";

import type { Category, Product } from "../../types";
import { formatCurrency } from "../../lib/currency";
import { formatColorOptions, parseDimensions } from "../../lib/product";

interface AdminProductEditorProps {
  product: Product;
  categories: Category[];
  isGeneratingAdminDescription: boolean;
  onUpdateAdminProductDraft: (field: keyof Product, value: string | boolean) => void;
  onUpdateAdminProductDraftDimensions: (field: "width" | "height", value: string) => void;
  onGenerateAdminDraftDescription: () => void;
  onProductImageInput: (productId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onProductImageDrop: (productId: string, event: DragEvent<HTMLLabelElement>) => void;
  onProductGalleryInput: (productId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onProductGalleryDrop: (productId: string, event: DragEvent<HTMLLabelElement>) => void;
  onRemoveAdminProductDraftGalleryImage: (imageIndex: number) => void;
  onCancelAdminProductEditor: () => void;
  onSaveAdminProductEditor: () => void;
}

export function AdminProductEditor({
  product,
  categories,
  isGeneratingAdminDescription,
  onUpdateAdminProductDraft,
  onUpdateAdminProductDraftDimensions,
  onGenerateAdminDraftDescription,
  onProductImageInput,
  onProductImageDrop,
  onProductGalleryInput,
  onProductGalleryDrop,
  onRemoveAdminProductDraftGalleryImage,
  onCancelAdminProductEditor,
  onSaveAdminProductEditor
}: AdminProductEditorProps) {
  const dimensions = parseDimensions(product.dimensions);
  const categoryLabel =
    categories.find((category) => category.id === product.category)?.label ?? product.category;

  function appendDescriptionSnippet(snippet: string) {
    const separator = product.description.trim() ? "\n\n" : "";
    onUpdateAdminProductDraft("description", `${product.description}${separator}${snippet}`);
  }

  return (
    <div className="admin-product-editor product-form-editor">
      <div className="product-form-topbar">
        <button className="product-form-back" type="button" onClick={onCancelAdminProductEditor}>
          &lt; Produtos / Editar produto
        </button>
        <span>Salvo neste navegador</span>
      </div>

      <div className="product-form-alert">
        Para o produto ficar disponível, preencha as informações principais e salve as alterações.
      </div>

      <div className="product-form-tabs">
        <span className="is-active">Ver produto no site</span>
        <span>Editar</span>
      </div>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Informações principais</h3>
          <label className="product-form-switch">
            <span>Produto ativo</span>
            <input type="checkbox" checked readOnly />
          </label>
        </div>

        <div className="product-form-body">
          <div className="product-form-grid product-form-grid-main">
            <label>
              <span>Nome do produto</span>
              <input
                value={product.name}
                onChange={(event) => onUpdateAdminProductDraft("name", event.target.value)}
              />
            </label>

            <label>
              <span>Preço</span>
              <input
                inputMode="numeric"
                value={formatCurrency(product.priceInCents)}
                onChange={(event) =>
                  onUpdateAdminProductDraft("priceInCents", event.target.value)
                }
              />
            </label>

            <label>
              <span>Situação</span>
              <select value="active" onChange={() => undefined}>
                <option value="active">Ativo</option>
              </select>
            </label>
          </div>

          <div className="product-form-toggle-grid">
            <label className="product-form-switch-card">
              <span>Com variação</span>
              <input type="checkbox" checked={Boolean(product.colorOptions?.length)} readOnly />
            </label>
            <label className="product-form-switch-card">
              <span>Visível</span>
              <input type="checkbox" checked readOnly />
            </label>
            <label className="product-form-switch-card">
              <span>À venda</span>
              <input type="checkbox" checked readOnly />
            </label>
            <label className="product-form-switch-card">
              <span>Em destaque</span>
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(event) =>
                  onUpdateAdminProductDraft("featured", event.target.checked)
                }
              />
            </label>
          </div>

          <label className="product-form-description">
            <span>Descrição</span>
            <div className="product-form-toolbar">
              <button
                type="button"
                onClick={() => appendDescriptionSnippet("**Texto em destaque**")}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => appendDescriptionSnippet("_Texto em itálico_")}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => appendDescriptionSnippet("- Primeiro benefício\n- Segundo benefício")}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => appendDescriptionSnippet("[Texto do link](https://exemplo.com)")}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => appendDescriptionSnippet("Imagem: descreva aqui a imagem do produto.")}
              >
                Imagem
              </button>
            </div>
            <textarea
              value={product.description}
              onChange={(event) => onUpdateAdminProductDraft("description", event.target.value)}
            />
          </label>

          <div className="admin-inline-actions">
            <button
              className="ghost-action"
              type="button"
              onClick={onGenerateAdminDraftDescription}
              disabled={isGeneratingAdminDescription}
            >
              {isGeneratingAdminDescription ? "Gerando..." : "Gerar descrição com IA"}
            </button>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Códigos</h3>
        </div>
        <div className="product-form-body">
          <div className="product-form-grid">
            <label>
              <span>Código do produto (SKU)</span>
              <input
                value={product.slug}
                onChange={(event) => onUpdateAdminProductDraft("slug", event.target.value)}
              />
            </label>
            <label>
              <span>GTIN</span>
              <input placeholder="-" readOnly />
            </label>
            <label>
              <span>MPN</span>
              <input placeholder="-" readOnly />
            </label>
            <label>
              <span>NCM</span>
              <input placeholder="-" readOnly />
            </label>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Variações do produto</h3>
        </div>
        <div className="product-form-body">
          <div className="product-form-info">
            Escolha abaixo quais são os tipos de variação que este produto pode ter.
          </div>

          <label>
            <span>Cores do produto</span>
            <textarea
              value={formatColorOptions(product.colorOptions ?? [])}
              onChange={(event) =>
                onUpdateAdminProductDraft("colorOptions", event.target.value)
              }
              placeholder={"Branco=#f8fbff\nBranco e Azul=#f8fbff, #3a86ff"}
            />
          </label>

          <div className="product-form-check-list">
            <label><input type="checkbox" readOnly /> Tamanho de camisa</label>
            <label><input type="checkbox" readOnly /> Tamanho de calça</label>
            <label><input type="checkbox" readOnly /> Voltagem</label>
            <label><input type="checkbox" readOnly /> Material</label>
            <label><input type="checkbox" checked readOnly /> Cor</label>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Imagens do produto</h3>
          <label className="ghost-action product-form-file-button">
            Escolher imagens
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(event) => onProductGalleryInput(product.id, event)}
            />
          </label>
        </div>
        <div className="product-form-body">
          <label
            className="product-form-main-image"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onProductImageDrop(product.id, event)}
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <span>Arraste a imagem principal aqui</span>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(event) => onProductImageInput(product.id, event)}
            />
          </label>

          {product.imageUrl ? (
            <button
              className="ghost-action admin-upload-remove"
              type="button"
              onClick={() => onUpdateAdminProductDraft("imageUrl", "")}
            >
              Remover imagem principal
            </button>
          ) : null}

          {product.galleryImages && product.galleryImages.length > 0 ? (
            <div className="admin-gallery-grid product-form-gallery">
              {product.galleryImages.map((image, index) => (
                <div key={`${product.id}-gallery-${index}`} className="admin-gallery-card">
                  <img src={image} alt={`${product.name} ${index + 2}`} />
                  <button
                    className="ghost-action"
                    type="button"
                    onClick={() => onRemoveAdminProductDraftGalleryImage(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="product-form-video">
            <span>Vídeo</span>
            <input placeholder="Ex. https://www.youtube.com/watch?v=..." readOnly />
          </label>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Informações fiscais</h3>
          <p>Utilizadas em cadastros comerciais e emissão de documentos.</p>
        </div>
        <div className="product-form-body">
          <div className="product-form-grid">
            <label>
              <span>Tipo de produção</span>
              <select value="own" onChange={() => undefined}>
                <option value="own">Produção própria</option>
              </select>
            </label>
            <label>
              <span>Origem da mercadoria</span>
              <select value="national" onChange={() => undefined}>
                <option value="national">Nacional</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Especifique para melhorar resultados</h3>
          <p>Dados usados para organizar busca e filtros da loja.</p>
        </div>
        <div className="product-form-body">
          <label>
            <span>Classificação de mercado</span>
            <select
              value={product.category}
              onChange={(event) => onUpdateAdminProductDraft("category", event.target.value)}
            >
              {categories
                .filter((category) => category.id !== "all")
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
            </select>
          </label>

          <div className="product-form-grid">
            <label>
              <span>Material</span>
              <input
                value={product.material}
                onChange={(event) => onUpdateAdminProductDraft("material", event.target.value)}
              />
            </label>
            <label>
              <span>Cor destaque</span>
              <input
                value={product.accentColor}
                onChange={(event) =>
                  onUpdateAdminProductDraft("accentColor", event.target.value)
                }
              />
            </label>
          </div>

          <div className="product-form-grid">
            <label>
              <span>Largura (cm)</span>
              <input
                inputMode="decimal"
                value={dimensions.width}
                onChange={(event) =>
                  onUpdateAdminProductDraftDimensions("width", event.target.value)
                }
              />
            </label>
            <label>
              <span>Altura (cm)</span>
              <input
                inputMode="decimal"
                value={dimensions.height}
                onChange={(event) =>
                  onUpdateAdminProductDraftDimensions("height", event.target.value)
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div className="product-form-section-header">
          <h3>Organize na loja</h3>
        </div>
        <div className="product-form-body">
          <label>
            <span>Categoria dentro da loja</span>
            <input value={categoryLabel} readOnly />
          </label>
          <label>
            <span>Tags</span>
            <input
              value={product.tags.join(", ")}
              onChange={(event) => onUpdateAdminProductDraft("tags", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="product-form-section product-form-seo">
        <div className="product-form-section-header">
          <h3>Apareça nas buscas com SEO</h3>
          <p>Confira como este produto pode aparecer nos resultados de busca.</p>
        </div>
        <div className="product-form-body product-form-seo-body">
          <div>
            <label>
              <span>Tag Title</span>
              <input value={product.name} readOnly />
            </label>
            <label>
              <span>Meta descrição</span>
              <textarea value={product.description} readOnly />
            </label>
            <label>
              <span>URL do produto</span>
              <input value={`/produto/${product.slug}`} readOnly />
            </label>
          </div>

          <aside className="product-form-seo-preview">
            <span>● ● ●</span>
            <strong>{product.name}</strong>
            <small>{product.description}</small>
          </aside>
        </div>
      </section>

      <div className="admin-editor-actions product-form-actions">
        <button className="ghost-action" type="button" onClick={onCancelAdminProductEditor}>
          Cancelar
        </button>
        <button className="admin-primary-action" type="button" onClick={onSaveAdminProductEditor}>
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
