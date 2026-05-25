import cors from "@fastify/cors";
import Fastify from "fastify";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { categories, products, type Product } from "./data/products.js";

const server = Fastify({
  logger: true
});

await server.register(cors, {
  origin: true
});

const ordersFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/orders.json"
);
const productsFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/products-admin.json"
);
const usersFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/users.json"
);

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

interface StoredOrder {
  id: string;
  status: "pending_payment";
  paymentMethod: "pix" | "whatsapp";
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    label: string;
    street: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    productId: string;
    name: string;
    priceInCents: number;
    quantity: number;
    subtotalInCents: number;
  }>;
  totalInCents: number;
}

function hashPassword(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function sanitizeUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function createDefaultAdminUser(): StoredUser {
  const passwordSalt = "dabi-tech-admin";

  return {
    id: "admin",
    name: "Admin DaBi",
    email: "admin@dabitech3d.com",
    role: "admin",
    passwordSalt,
    passwordHash: hashPassword("admin123", passwordSalt),
    createdAt: "2026-05-25T00:00:00.000Z"
  };
}

async function readUsers() {
  try {
    const content = await readFile(usersFilePath, "utf8");
    const storedUsers = JSON.parse(content) as StoredUser[];

    if (Array.isArray(storedUsers) && storedUsers.length > 0) {
      return storedUsers;
    }
  } catch {
    // Seed the admin user below.
  }

  const defaultUsers = [createDefaultAdminUser()];
  await saveUsers(defaultUsers);
  return defaultUsers;
}

async function saveUsers(users: StoredUser[]) {
  await mkdir(dirname(usersFilePath), { recursive: true });
  await writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

async function readOrders() {
  try {
    const content = await readFile(ordersFilePath, "utf8");
    return JSON.parse(content) as StoredOrder[];
  } catch {
    return [];
  }
}

async function saveOrders(orders: StoredOrder[]) {
  await mkdir(dirname(ordersFilePath), { recursive: true });
  await writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

async function readCatalogProducts() {
  try {
    const content = await readFile(productsFilePath, "utf8");
    const storedProducts = JSON.parse(content) as Product[];

    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      return storedProducts;
    }
  } catch {
    // Use bundled products until the admin saves the catalog for the first time.
  }

  return products;
}

async function saveCatalogProducts(nextProducts: Product[]) {
  await mkdir(dirname(productsFilePath), { recursive: true });
  await writeFile(productsFilePath, JSON.stringify(nextProducts, null, 2));
}

function isFilledString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isProductPayload(value: unknown): value is Product {
  const product = value as Product;

  return (
    typeof product === "object" &&
    product !== null &&
    isFilledString(product.id) &&
    isFilledString(product.name) &&
    isFilledString(product.slug) &&
    Number.isFinite(product.priceInCents) &&
    isFilledString(product.category) &&
    isFilledString(product.material) &&
    isFilledString(product.dimensions) &&
    isFilledString(product.accentColor) &&
    typeof product.featured === "boolean" &&
    isFilledString(product.description) &&
    Array.isArray(product.tags)
  );
}

function createOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DABI-${timestamp}-${suffix}`;
}

server.get("/", async () => ({
  service: "e-commerce-3d-api",
  status: "online",
  frontendUrl: "http://127.0.0.1:3010",
  endpoints: ["/health", "/api/categories", "/api/products", "/api/orders"]
}));

server.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString()
}));

server.get("/api/categories", async () => ({
  items: categories
}));

server.post("/api/auth/login", async (request, reply) => {
  const body = request.body as {
    email?: string;
    password?: string;
  };

  if (!isFilledString(body.email) || !isFilledString(body.password)) {
    reply.status(400);
    return { message: "Informe e-mail e senha." };
  }

  const email = String(body.email).trim();
  const password = String(body.password);
  const users = await readUsers();
  const normalizedEmail = email.toLowerCase();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password, user.passwordSalt)) {
    reply.status(401);
    return { message: "E-mail ou senha inválidos." };
  }

  return {
    token: `local-${user.id}-${Date.now()}`,
    user: sanitizeUser(user)
  };
});

server.post("/api/auth/register", async (request, reply) => {
  const body = request.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (
    !isFilledString(body.name) ||
    !isFilledString(body.email) ||
    !isFilledString(body.password)
  ) {
    reply.status(400);
    return { message: "Informe nome, e-mail e senha." };
  }

  const name = String(body.name).trim();
  const email = String(body.email).trim();
  const password = String(body.password);

  if (password.trim().length < 6) {
    reply.status(400);
    return { message: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const users = await readUsers();
  const normalizedEmail = email.toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    reply.status(409);
    return { message: "Já existe uma conta com este e-mail." };
  }

  const passwordSalt = randomUUID();
  const user: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    email: normalizedEmail,
    role: "customer",
    passwordSalt,
    passwordHash: hashPassword(password, passwordSalt),
    createdAt: new Date().toISOString()
  };

  const nextUsers = [...users, user];
  await saveUsers(nextUsers);

  reply.status(201);
  return {
    token: `local-${user.id}-${Date.now()}`,
    user: sanitizeUser(user)
  };
});

server.get("/api/products", async (request) => {
  const query = request.query as {
    category?: string;
    featured?: string;
    q?: string;
  };

  const normalizedQuery = query.q?.trim().toLowerCase();
  const catalogProducts = await readCatalogProducts();

  const items = catalogProducts.filter((product) => {
    const categoryMatch =
      !query.category || query.category === "all"
        ? true
        : product.category === query.category;

    const featuredMatch =
      query.featured === "true" ? product.featured : true;

    const textMatch = normalizedQuery
      ? [
          product.name,
          product.description,
          product.material,
          ...product.tags
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    return categoryMatch && featuredMatch && textMatch;
  });

  return {
    total: items.length,
    items
  };
});

server.get("/api/products/:slug", async (request, reply) => {
  const params = request.params as { slug: string };
  const catalogProducts = await readCatalogProducts();
  const product = catalogProducts.find((item) => item.slug === params.slug);

  if (!product) {
    reply.status(404);
    return {
      message: "Produto não encontrado."
    };
  }

  return product;
});

server.post("/api/products", async (request, reply) => {
  const body = request.body;

  if (!isProductPayload(body)) {
    reply.status(400);
    return { message: "Produto inválido." };
  }

  const catalogProducts = await readCatalogProducts();

  if (catalogProducts.some((product) => product.id === body.id || product.slug === body.slug)) {
    reply.status(409);
    return { message: "Já existe um produto com este ID ou slug." };
  }

  const nextProducts = [...catalogProducts, body];
  await saveCatalogProducts(nextProducts);

  reply.status(201);
  return { product: body, items: nextProducts };
});

server.put("/api/products/:id", async (request, reply) => {
  const params = request.params as { id: string };
  const body = request.body;

  if (!isProductPayload(body) || body.id !== params.id) {
    reply.status(400);
    return { message: "Produto inválido." };
  }

  const catalogProducts = await readCatalogProducts();
  const productExists = catalogProducts.some((product) => product.id === params.id);

  if (!productExists) {
    reply.status(404);
    return { message: "Produto não encontrado." };
  }

  if (
    catalogProducts.some(
      (product) => product.id !== params.id && product.slug === body.slug
    )
  ) {
    reply.status(409);
    return { message: "Já existe outro produto com este slug." };
  }

  const nextProducts = catalogProducts.map((product) =>
    product.id === params.id ? body : product
  );
  await saveCatalogProducts(nextProducts);

  return { product: body, items: nextProducts };
});

server.delete("/api/products/:id", async (request, reply) => {
  const params = request.params as { id: string };
  const catalogProducts = await readCatalogProducts();
  const nextProducts = catalogProducts.filter((product) => product.id !== params.id);

  if (nextProducts.length === catalogProducts.length) {
    reply.status(404);
    return { message: "Produto não encontrado." };
  }

  await saveCatalogProducts(nextProducts);

  return { items: nextProducts };
});

server.post("/api/products/reset", async () => {
  await saveCatalogProducts(products);

  return { items: products };
});

server.post("/api/orders", async (request, reply) => {
  const body = request.body as {
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    address?: {
      label?: string;
      street?: string;
      district?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    items?: Array<{
      productId?: string;
      quantity?: number;
    }>;
    paymentMethod?: "pix" | "whatsapp";
  };

  if (
    !isFilledString(body.customer?.name) ||
    !isFilledString(body.customer?.email) ||
    !isFilledString(body.customer?.phone)
  ) {
    reply.status(400);
    return { message: "Informe nome, e-mail e telefone para finalizar o pedido." };
  }

  if (
    !isFilledString(body.address?.label) ||
    !isFilledString(body.address?.street) ||
    !isFilledString(body.address?.district) ||
    !isFilledString(body.address?.city) ||
    !isFilledString(body.address?.state) ||
    !isFilledString(body.address?.zipCode)
  ) {
    reply.status(400);
    return { message: "Informe um endereço de entrega válido." };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    reply.status(400);
    return { message: "Adicione pelo menos um produto ao carrinho." };
  }

  const customer = body.customer;
  const address = body.address;

  if (!customer || !address) {
    reply.status(400);
    return { message: "Informe cliente e endereço para finalizar o pedido." };
  }

  const catalogProducts = await readCatalogProducts();
  const orderItems = body.items.map((item) => {
    const product = catalogProducts.find((entry) => entry.id === item.productId);
    const quantity = Math.max(1, Math.floor(Number(item.quantity ?? 0)));

    if (!product || !Number.isFinite(quantity)) {
      return null;
    }

    return {
      productId: product.id,
      name: product.name,
      priceInCents: product.priceInCents,
      quantity,
      subtotalInCents: product.priceInCents * quantity
    };
  });

  if (orderItems.some((item) => item === null)) {
    reply.status(400);
    return { message: "O carrinho possui produto ou quantidade inválida." };
  }

  const safeItems = orderItems as StoredOrder["items"];
  const order: StoredOrder = {
    id: createOrderId(),
    status: "pending_payment",
    paymentMethod: body.paymentMethod === "whatsapp" ? "whatsapp" : "pix",
    createdAt: new Date().toISOString(),
    customer: {
      name: customer.name!.trim(),
      email: customer.email!.trim(),
      phone: customer.phone!.trim()
    },
    address: {
      label: address.label!.trim(),
      street: address.street!.trim(),
      district: address.district!.trim(),
      city: address.city!.trim(),
      state: address.state!.trim().toUpperCase(),
      zipCode: address.zipCode!.trim()
    },
    items: safeItems,
    totalInCents: safeItems.reduce((total, item) => total + item.subtotalInCents, 0)
  };

  const orders = await readOrders();
  orders.unshift(order);
  await saveOrders(orders);

  reply.status(201);
  return {
    order,
    instructions:
      order.paymentMethod === "pix"
        ? "Pedido recebido. Envie o Pix para a chave cadastrada da loja e informe o número do pedido no comprovante."
        : "Pedido recebido. Nossa equipe continuará o atendimento pelo WhatsApp para combinar pagamento e entrega."
  };
});

server.get("/api/orders/:id", async (request, reply) => {
  const params = request.params as { id: string };
  const orders = await readOrders();
  const order = orders.find((item) => item.id === params.id);

  if (!order) {
    reply.status(404);
    return { message: "Pedido não encontrado." };
  }

  return { order };
});

server.post("/api/ai/product-description", async (request, reply) => {
  const body = request.body as {
    name?: string;
    category?: string;
    material?: string;
    dimensions?: string;
    tags?: string[];
    colorSummary?: string;
  };

  if (!process.env.OPENAI_API_KEY) {
    reply.status(503);
    return {
      message: "Configure OPENAI_API_KEY para usar a geração de descrição com IA."
    };
  }

  const prompt = [
    "Gere uma descrição curta e comercial em português do Brasil para um e-commerce de produtos 3D.",
    "Tom: direto, premium e focado em compra.",
    "Evite exageros e repetições.",
    `Nome: ${body.name ?? ""}`,
    `Categoria: ${body.category ?? ""}`,
    `Material: ${body.material ?? ""}`,
    `Dimensões: ${body.dimensions ?? ""}`,
    `Cores: ${body.colorSummary ?? ""}`,
    `Tags: ${(body.tags ?? []).join(", ")}`
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: prompt
    })
  });

  const data = (await response.json()) as {
    output_text?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.output_text) {
    reply.status(502);
    return {
      message: data.error?.message ?? "Não foi possível gerar a descrição com IA."
    };
  }

  return {
    description: data.output_text.trim()
  };
});

const port = Number(process.env.PORT ?? 4020);
const host = process.env.HOST ?? "127.0.0.1";

server
  .listen({
    port,
    host
  })
  .catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
