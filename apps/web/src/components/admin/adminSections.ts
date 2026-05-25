export type AdminSection =
  | "orders-list"
  | "orders-create"
  | "cart-link"
  | "customers"
  | "reports"
  | "invoices"
  | "products"
  | "product-create"
  | "reviews"
  | "import"
  | "segmented-prices"
  | "categories"
  | "brands"
  | "grades"
  | "product-trash"
  | "promos"
  | "gifts"
  | "coupons"
  | "automations"
  | "bundle"
  | "free-shipping"
  | "newsletter"
  | "back-in-stock"
  | "logo"
  | "visual"
  | "slides"
  | "social"
  | "content-pages"
  | "email-editor"
  | "settings-general"
  | "store-data"
  | "users"
  | "payments"
  | "shipping";

export const adminSectionLabels: Record<AdminSection, { title: string; description: string }> = {
  "orders-list": {
    title: "Listar pedidos",
    description: "Acompanhe pedidos recebidos, status, cliente e itens comprados."
  },
  "orders-create": {
    title: "Criar pedidos",
    description: "Crie pedidos manualmente para vendas combinadas fora da loja."
  },
  "cart-link": {
    title: "Link de carrinho",
    description: "Gere links compartilháveis com produtos pré-selecionados."
  },
  customers: {
    title: "Clientes",
    description: "Consulte clientes, contatos e histórico de compras."
  },
  reports: {
    title: "Relatórios",
    description: "Veja indicadores comerciais e operação da loja."
  },
  invoices: {
    title: "Notas fiscais",
    description: "Organize emissões fiscais e documentos de venda."
  },
  products: {
    title: "Listar produtos",
    description: "Edite catálogo, imagens, preços, descrições e variações."
  },
  "product-create": {
    title: "Criar produto",
    description: "Cadastre um novo produto no catálogo."
  },
  reviews: {
    title: "Avaliações",
    description: "Gerencie avaliações e comentários dos compradores."
  },
  import: {
    title: "Importar",
    description: "Importe produtos em lote para acelerar o cadastro."
  },
  "segmented-prices": {
    title: "Preços segmentados",
    description: "Configure preços por canal, cliente ou campanha."
  },
  categories: {
    title: "Categorias",
    description: "Organize os produtos por categorias de navegação."
  },
  brands: {
    title: "Marcas",
    description: "Cadastre marcas e linhas de produto."
  },
  grades: {
    title: "Grades",
    description: "Configure grades e variações reutilizáveis."
  },
  "product-trash": {
    title: "Lixeira de produtos",
    description: "Revise produtos removidos antes da exclusão definitiva."
  },
  promos: {
    title: "Promoções",
    description: "Edite cards promocionais e destaques comerciais."
  },
  gifts: {
    title: "Brinde",
    description: "Configure brindes em compras elegíveis."
  },
  coupons: {
    title: "Cupons de desconto",
    description: "Crie e acompanhe cupons promocionais."
  },
  automations: {
    title: "Automações",
    description: "Configure ações automáticas para marketing e operação."
  },
  bundle: {
    title: "Compre junto",
    description: "Monte combinações de produtos para aumentar ticket médio."
  },
  "free-shipping": {
    title: "Frete grátis",
    description: "Defina campanhas e regras de frete grátis."
  },
  newsletter: {
    title: "Newsletter",
    description: "Gerencie captação e disparos de e-mail."
  },
  "back-in-stock": {
    title: "Avise-me",
    description: "Acompanhe interessados em produtos indisponíveis."
  },
  logo: {
    title: "Logo",
    description: "Gerencie as assinaturas visuais da marca."
  },
  visual: {
    title: "Visual da loja",
    description: "Ajuste cores, tema e aparência geral da loja."
  },
  slides: {
    title: "Banners",
    description: "Edite imagens do carrossel principal da vitrine."
  },
  social: {
    title: "Redes Sociais",
    description: "Configure links sociais exibidos na loja."
  },
  "content-pages": {
    title: "Página de conteúdo",
    description: "Crie páginas institucionais e informativas."
  },
  "email-editor": {
    title: "Editor de e-mail",
    description: "Personalize mensagens transacionais da loja."
  },
  "settings-general": {
    title: "Gerais",
    description: "Configure preferências gerais da operação."
  },
  "store-data": {
    title: "Dados da loja",
    description: "Edite razão social, contato e informações comerciais."
  },
  users: {
    title: "Usuários",
    description: "Gerencie acessos da equipe."
  },
  payments: {
    title: "Formas de pagamento",
    description: "Configure métodos de pagamento aceitos."
  },
  shipping: {
    title: "Formas de envio",
    description: "Configure métodos, prazos e regras de entrega."
  }
};

export const adminMenuGroups: Array<{
  title: string;
  items: Array<{ label: string; section: AdminSection; action?: "create-product" }>;
}> = [
  {
    title: "Vendas",
    items: [
      { label: "Listar pedidos", section: "orders-list" },
      { label: "Criar pedidos", section: "orders-create" },
      { label: "Link de carrinho", section: "cart-link" },
      { label: "Clientes", section: "customers" },
      { label: "Relatórios", section: "reports" },
      { label: "Notas fiscais", section: "invoices" }
    ]
  },
  {
    title: "Produtos",
    items: [
      { label: "Listar produtos", section: "products" },
      { label: "Criar produto", section: "product-create", action: "create-product" },
      { label: "Avaliações", section: "reviews" },
      { label: "Importar", section: "import" },
      { label: "Preços segmentados", section: "segmented-prices" },
      { label: "Categorias", section: "categories" },
      { label: "Marcas", section: "brands" },
      { label: "Grades", section: "grades" },
      { label: "Lixeira de produtos", section: "product-trash" }
    ]
  },
  {
    title: "Marketing",
    items: [
      { label: "Promoções", section: "promos" },
      { label: "Brinde", section: "gifts" },
      { label: "Cupons de desconto", section: "coupons" },
      { label: "Automações", section: "automations" },
      { label: "Compre junto", section: "bundle" },
      { label: "Frete grátis", section: "free-shipping" },
      { label: "Newsletter", section: "newsletter" },
      { label: "Avise-me", section: "back-in-stock" }
    ]
  },
  {
    title: "Personalize sua loja",
    items: [
      { label: "Logo", section: "logo" },
      { label: "Visual da loja", section: "visual" },
      { label: "Banners", section: "slides" },
      { label: "Redes Sociais", section: "social" },
      { label: "Página de conteúdo", section: "content-pages" },
      { label: "Editor de e-mail", section: "email-editor" }
    ]
  },
  {
    title: "Configurações",
    items: [
      { label: "Gerais", section: "settings-general" },
      { label: "Dados da loja", section: "store-data" },
      { label: "Usuários", section: "users" },
      { label: "Formas de pagamento", section: "payments" },
      { label: "Formas de envio", section: "shipping" }
    ]
  }
];
