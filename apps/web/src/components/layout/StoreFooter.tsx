import { DabiLogo } from "./DabiLogo";

const footerSections = [
  {
    title: "Atendimento",
    links: ["Central de ajuda", "Fale conosco", "Trocas e devoluções", "Prazos de produção"]
  },
  {
    title: "Páginas",
    links: ["Início", "Produtos", "Ofertas", "Favoritos"]
  },
  {
    title: "Institucional",
    links: ["Política de privacidade", "Termos de uso", "Envio e entrega", "Garantia"]
  },
  {
    title: "A Empresa",
    links: ["Sobre a Forma 3D", "Produção sob demanda", "Materiais utilizados", "Contato comercial"]
  },
  {
    title: "Redes Sociais",
    links: ["Instagram", "TikTok", "YouTube", "Pinterest"]
  }
];

const paymentMethods = ["VISA", "Mastercard", "Elo", "Amex", "Boleto", "Pix"];

interface StoreFooterProps {
  onOpenPage?: (title: string) => void;
}

export function StoreFooter({ onOpenPage }: StoreFooterProps) {
  return (
    <footer className="store-footer">
      <div className="store-footer-inner">
        <div className="store-footer-brand">
          <DabiLogo className="footer-logo-image" />
          <div>
            <p>Produtos 3D autorais para setup, decoração e colecionáveis.</p>
          </div>
        </div>

        <div className="store-footer-grid">
          {footerSections.map((section) => (
            <section key={section.title} className="store-footer-section">
              <h3>{section.title}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link}>
                    <button type="button" onClick={() => onOpenPage?.(link)}>{link}</button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="store-footer-trust">
          <section>
            <h3>Formas de pagamento</h3>
            <div className="payment-badges">
              {paymentMethods.map((method) => (
                <span key={method}>{method}</span>
              ))}
            </div>
          </section>

          <section className="trust-seals">
            <h3>Segurança</h3>
            <div className="trust-seal-grid">
              <div className="trust-seal-card">
                <strong>Site seguro</strong>
                <span>Espaço para selo SSL/antifraude</span>
                <small>Requer cadastro ou script do provedor do selo.</small>
              </div>
              <div className="trust-seal-card">
                <strong>Google Safe Browsing</strong>
                <span>Espaço para validação Google</span>
                <small>Normalmente depende de verificação, chave ou permissão.</small>
              </div>
            </div>
          </section>
        </div>

        <div className="store-footer-bottom">
          <span>© 2026 DaBi Tech 3D. Todos os direitos reservados.</span>
          <span>CNPJ e dados fiscais podem ser configurados no painel administrativo.</span>
        </div>
      </div>
    </footer>
  );
}
