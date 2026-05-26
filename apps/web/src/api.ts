import type {
  AuthResponse,
  Category,
  CreateOrderPayload,
  CreateOrderResponse,
  Order,
  Product
} from "./types";

const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:4020");

function buildJsonHeaders(authToken?: string | null) {
  return {
    "content-type": "application/json",
    ...(authToken ? { authorization: `Bearer ${authToken}` } : {})
  };
}

function buildAuthHeaders(authToken?: string | null) {
  return authToken ? { authorization: `Bearer ${authToken}` } : undefined;
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Falha ao carregar produtos.");
  }

  const data = (await response.json()) as { items: Product[] };
  return data.items;
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as Partial<AuthResponse> & { message?: string };

  if (!response.ok || !data.user || !data.token) {
    throw new Error(data.message ?? "Falha ao entrar.");
  }

  return {
    user: data.user,
    token: data.token
  };
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as Partial<AuthResponse> & { message?: string };

  if (!response.ok || !data.user || !data.token) {
    throw new Error(data.message ?? "Falha ao cadastrar.");
  }

  return {
    user: data.user,
    token: data.token
  };
}

export async function createProduct(product: Product, authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: buildJsonHeaders(authToken),
    body: JSON.stringify(product)
  });

  const data = (await response.json()) as { product?: Product; items?: Product[]; message?: string };

  if (!response.ok || !data.product || !data.items) {
    throw new Error(data.message ?? "Falha ao criar produto.");
  }

  return {
    product: data.product,
    items: data.items
  };
}

export async function updateProduct(product: Product, authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/products/${product.id}`, {
    method: "PUT",
    headers: buildJsonHeaders(authToken),
    body: JSON.stringify(product)
  });

  const data = (await response.json()) as { product?: Product; items?: Product[]; message?: string };

  if (!response.ok || !data.product || !data.items) {
    throw new Error(data.message ?? "Falha ao salvar produto.");
  }

  return {
    product: data.product,
    items: data.items
  };
}

export async function deleteProduct(productId: string, authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/products/${productId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(authToken)
  });

  const data = (await response.json()) as { items?: Product[]; message?: string };

  if (!response.ok || !data.items) {
    throw new Error(data.message ?? "Falha ao deletar produto.");
  }

  return data.items;
}

export async function resetProducts(authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/products/reset`, {
    method: "POST",
    headers: buildAuthHeaders(authToken)
  });

  const data = (await response.json()) as { items?: Product[]; message?: string };

  if (!response.ok || !data.items) {
    throw new Error(data.message ?? "Falha ao restaurar produtos.");
  }

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
}, authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/ai/product-description`, {
    method: "POST",
    headers: buildJsonHeaders(authToken),
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

export async function getOrders(authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/orders`, {
    headers: buildAuthHeaders(authToken)
  });
  const data = (await response.json()) as { items?: Order[]; message?: string };

  if (!response.ok || !data.items) {
    throw new Error(data.message ?? "Falha ao carregar pedidos.");
  }

  return data.items;
}

export async function getMyOrders(authToken?: string | null) {
  const response = await fetch(`${API_URL}/api/me/orders`, {
    headers: buildAuthHeaders(authToken)
  });
  const data = (await response.json()) as { items?: Order[]; message?: string };

  if (!response.ok || !data.items) {
    throw new Error(data.message ?? "Falha ao carregar suas compras.");
  }

  return data.items;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  authToken?: string | null
) {
  const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: buildJsonHeaders(authToken),
    body: JSON.stringify({ status })
  });
  const data = (await response.json()) as { order?: Order; message?: string };

  if (!response.ok || !data.order) {
    throw new Error(data.message ?? "Falha ao atualizar pedido.");
  }

  return data.order;
}

export async function getStorefront() {
  const response = await fetch(`${API_URL}/api/storefront`);
  const data = (await response.json()) as {
    slides?: unknown[];
    promoCards?: unknown[];
    updatedAt?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? "Falha ao carregar vitrine.");
  }

  return data;
}

export async function updateStorefront(
  payload: { slides: unknown[]; promoCards: unknown[] },
  authToken?: string | null
) {
  const response = await fetch(`${API_URL}/api/storefront`, {
    method: "PUT",
    headers: buildJsonHeaders(authToken),
    body: JSON.stringify(payload)
  });
  const data = (await response.json()) as {
    slides?: unknown[];
    promoCards?: unknown[];
    updatedAt?: string;
    message?: string;
  };

  if (!response.ok || !Array.isArray(data.slides) || !Array.isArray(data.promoCards)) {
    throw new Error(data.message ?? "Falha ao salvar vitrine.");
  }

  return data;
}
