export type ProductCategory =
  | "decor"
  | "gaming"
  | "fashion"
  | "workspace";

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  category: ProductCategory;
  material: string;
  dimensions: string;
  accentColor: string;
  imageUrl?: string;
  galleryImages?: string[];
  colorOptions?: Array<{
    id: string;
    name: string;
    swatches: string[];
  }>;
  featured: boolean;
  description: string;
  tags: string[];
}

export const products: Product[] = [
  {
    id: "p-001",
    name: "Nebula Vase",
    slug: "nebula-vase",
    priceInCents: 17990,
    category: "decor",
    material: "PLA premium",
    dimensions: "26 x 14 cm",
    accentColor: "#ff7a18",
    colorOptions: [
      { id: "sand", name: "Areia", swatches: ["#f3e6cc"] },
      { id: "ivory-gold", name: "Marfim e dourado", swatches: ["#f8f4ea", "#c79b34"] }
    ],
    featured: true,
    description: "Vaso escultural com textura paramétrica para ambientes contemporâneos.",
    tags: ["minimalista", "orgânico", "sala"]
  },
  {
    id: "p-002",
    name: "Orbit Headset Dock",
    slug: "orbit-headset-dock",
    priceInCents: 23990,
    category: "gaming",
    material: "PETG fosco",
    dimensions: "30 x 18 cm",
    accentColor: "#1fd1a5",
    colorOptions: [
      { id: "black-green", name: "Preto e verde", swatches: ["#101317", "#1fd1a5"] },
      { id: "graphite", name: "Grafite", swatches: ["#3b434c"] }
    ],
    featured: true,
    description: "Suporte de headset com presença de setup e base estável para mesa gamer.",
    tags: ["setup", "organização", "rgb"]
  },
  {
    id: "p-003",
    name: "Layered Lamp",
    slug: "layered-lamp",
    priceInCents: 32990,
    category: "decor",
    material: "PLA translúcido",
    dimensions: "34 x 20 cm",
    accentColor: "#ffd166",
    colorOptions: [
      { id: "amber", name: "Âmbar", swatches: ["#ffd166"] },
      { id: "smoke", name: "Fumê", swatches: ["#7d8590"] }
    ],
    featured: true,
    description: "Luminária impressa em camadas para um brilho suave e assinatura autoral.",
    tags: ["luz", "design", "premium"]
  },
  {
    id: "p-004",
    name: "Mod Rack",
    slug: "mod-rack",
    priceInCents: 14990,
    category: "workspace",
    material: "ABS reforçado",
    dimensions: "22 x 9 cm",
    accentColor: "#3a86ff",
    colorOptions: [
      { id: "blue-white", name: "Branco e azul", swatches: ["#f7fbff", "#3a86ff"] },
      { id: "black", name: "Preto", swatches: ["#1f2937"] }
    ],
    featured: false,
    description: "Organizador modular para acessórios de mesa, cabos e cartões.",
    tags: ["mesa", "office", "funcional"]
  },
  {
    id: "p-005",
    name: "Arc Sneaker Stand",
    slug: "arc-sneaker-stand",
    priceInCents: 19990,
    category: "fashion",
    material: "PLA texturizado",
    dimensions: "28 x 16 cm",
    accentColor: "#ff4d6d",
    colorOptions: [
      { id: "pink", name: "Rosa", swatches: ["#ff4d6d"] },
      { id: "cream-pink", name: "Creme e rosa", swatches: ["#fff5ea", "#ff4d6d"] }
    ],
    featured: false,
    description: "Base expositora para tênis colecionáveis com perfil limpo e inclinação elegante.",
    tags: ["drop", "coleção", "display"]
  },
  {
    id: "p-006",
    name: "Pulse Controller Cradle",
    slug: "pulse-controller-cradle",
    priceInCents: 15990,
    category: "gaming",
    material: "PETG carbon",
    dimensions: "18 x 12 cm",
    accentColor: "#7b61ff",
    colorOptions: [
      { id: "violet", name: "Violeta", swatches: ["#7b61ff"] },
      { id: "white-blue", name: "Branco e azul", swatches: ["#f8fbff", "#3a86ff"] }
    ],
    featured: false,
    description: "Base para controle com encaixe seguro e linguagem visual de peça de performance.",
    tags: ["console", "setup", "organização"]
  }
];

export const categories = [
  { id: "all", label: "Todos" },
  { id: "decor", label: "Decor" },
  { id: "gaming", label: "Gaming" },
  { id: "fashion", label: "Fashion" },
  { id: "workspace", label: "Workspace" }
];
