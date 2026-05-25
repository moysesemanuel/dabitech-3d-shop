import type { Category, CreateOrderPayload, CreateOrderResponse, Product } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4020";

export async function getProducts() {
  const response = await fetch(`${API_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Falha ao carregar produtos.");
  }

  const data = (await response.json()) as { items: Product[] };
  return data.items;
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Falha ao carregar categorias.");
  }

  const data = (await response.json()) as { items: Category[] };
  return data.items;
}

export async function generateProductDescription(payload: {
  name: string;
  category: string;
  material: string;
  dimensions: string;
  tags: string[];
  colorSummary: string;
}) {
  const response = await fetch(`${API_URL}/api/ai/product-description`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as { description?: string; message?: string };

  if (!response.ok || !data.description) {
    throw new Error(data.message ?? "Falha ao gerar descrição com IA.");
  }

  return data.description;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as Partial<CreateOrderResponse> & { message?: string };

  if (!response.ok || !data.order || !data.instructions) {
    throw new Error(data.message ?? "Falha ao finalizar pedido.");
  }

  return {
    order: data.order,
    instructions: data.instructions
  };
}
