import cors from "@fastify/cors";
import { neon } from "@neondatabase/serverless";
import Fastify from "fastify";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { categories, products, type Product } from "./data/products.js";

export const server = Fastify({
  logger: true
});

server.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["content-type", "authorization"]
});

const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET ?? "dev-dabi-tech-3d-secret";
const sql = databaseUrl ? neon(databaseUrl) : null;
let databaseReady: Promise<void> | null = null;

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
const storefrontFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/storefront.json"
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
  status: "pending_payment" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
  deliveryMethod: "delivery" | "pickup" | "combine";
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
  internalNotes?: string;
  statusHistory?: Array<{
    status: StoredOrder["status"];
    changedAt: string;
    changedBy: string;
  }>;
}

interface StoredStorefront {
  slides: unknown[];
  promoCards: unknown[];
  updatedAt: string;
}

type JsonRow<T> = {
  data: T;
};

async function ensureDatabase() {
  if (!sql) {
    return;
  }

  databaseReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `;
    await sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        data JSONB NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL
      )
    `;
  })();

  await databaseReady;
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

function createAuthToken(user: StoredUser) {
  const issuedAt = Date.now();
  const payload = `${user.id}.${user.role}.${issuedAt}`;
  const signature = createHmac("sha256", authSecret).update(payload).digest("hex");

  return `${payload}.${signature}`;
}

async function getAuthenticatedUser(request: { headers: Record<string, unknown> }) {
  const authorization = request.headers.authorization;

  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length);
  const [id, role, issuedAt, signature] = token.split(".");

  if (!id || !role || !issuedAt || !signature) {
    return null;
  }

  const payload = `${id}.${role}.${issuedAt}`;
  const expectedSignature = createHmac("sha256", authSecret).update(payload).digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  const users = await readUsers();
  return users.find((user) => user.id === id && user.role === role) ?? null;
}

async function requireAdmin(request: { headers: Record<string, unknown> }, reply: { status: (code: number) => void }) {
  const user = await getAuthenticatedUser(request);

  if (!user || user.role !== "admin") {
    reply.status(403);
    return null;
  }

  return user;
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
  if (sql) {
    await ensureDatabase();
    const rows = (await sql`
      SELECT data FROM users ORDER BY id
    `) as Array<JsonRow<StoredUser>>;

    if (rows.length > 0) {
      return rows.map((row) => row.data);
    }

    const defaultUsers = [createDefaultAdminUser()];
    await saveUsers(defaultUsers);
    return defaultUsers;
  }

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
  if (sql) {
    await ensureDatabase();
    await sql`DELETE FROM users`;

    for (const user of users) {
      await sql`
        INSERT INTO users (id, email, data)
        VALUES (${user.id}, ${user.email.toLowerCase()}, ${JSON.stringify(user)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          data = EXCLUDED.data
      `;
    }

    return;
  }

  await mkdir(dirname(usersFilePath), { recursive: true });
  await writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

async function readOrders() {
  if (sql) {
    await ensureDatabase();
    const rows = (await sql`
      SELECT data FROM orders ORDER BY data->>'createdAt' DESC
    `) as Array<JsonRow<StoredOrder>>;

    return rows.map((row) => row.data);
  }

  try {
    const content = await readFile(ordersFilePath, "utf8");
    return JSON.parse(content) as StoredOrder[];
  } catch {
    return [];
  }
}

async function saveOrders(orders: StoredOrder[]) {
  if (sql) {
    await ensureDatabase();
    await sql`DELETE FROM orders`;

    for (const order of orders) {
      await sql`
        INSERT INTO orders (id, data)
        VALUES (${order.id}, ${JSON.stringify(order)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
      `;
    }

    return;
  }

  await mkdir(dirname(ordersFilePath), { recursive: true });
  await writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

async function saveOrder(order: StoredOrder) {
  if (sql) {
    await ensureDatabase();
    await sql`
      INSERT INTO orders (id, data)
      VALUES (${order.id}, ${JSON.stringify(order)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;

    return;
  }

  const orders = await readOrders();
  const nextOrders = [order, ...orders.filter((item) => item.id !== order.id)];
  await saveOrders(nextOrders);
}

async function readStorefront(): Promise<StoredStorefront> {
  if (sql) {
    await ensureDatabase();
    const rows = (await sql`
      SELECT data FROM settings WHERE key = 'storefront'
    `) as Array<JsonRow<StoredStorefront>>;

    if (rows[0]?.data) {
      return rows[0].data;
    }
  } else {
    try {
      const content = await readFile(storefrontFilePath, "utf8");
      return JSON.parse(content) as StoredStorefront;
    } catch {
      // Return empty settings below.
    }
  }

  return {
    slides: [],
    promoCards: [],
    updatedAt: new Date().toISOString()
  };
}

async function saveStorefront(storefront: StoredStorefront) {
  if (sql) {
    await ensureDatabase();
    await sql`
      INSERT INTO settings (key, data)
      VALUES ('storefront', ${JSON.stringify(storefront)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data
    `;

    return;
  }

  await mkdir(dirname(storefrontFilePath), { recursive: true });
  await writeFile(storefrontFilePath, JSON.stringify(storefront, null, 2));
}

async function readCatalogProducts() {
  if (sql) {
    await ensureDatabase();
    const rows = (await sql`
      SELECT data FROM products ORDER BY sort_order ASC, id ASC
    `) as Array<JsonRow<Product>>;

    if (rows.length > 0) {
      return rows.map((row) => row.data);
    }

    await saveCatalogProducts(products);
    return products;
  }

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
  if (sql) {
    await ensureDatabase();
    await sql`DELETE FROM products`;

    for (const [index, product] of nextProducts.entries()) {
      await sql`
        INSERT INTO products (id, data, sort_order)
        VALUES (${product.id}, ${JSON.stringify(product)}::jsonb, ${index})
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          sort_order = EXCLUDED.sort_order
      `;
    }

    return;
  }

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
    (
      product.compareAtPriceInCents === undefined ||
      (
        Number.isFinite(product.compareAtPriceInCents) &&
        product.compareAtPriceInCents > product.priceInCents
      )
    ) &&
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
    token: createAuthToken(user),
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
    token: createAuthToken(user),
    user: sanitizeUser(user)
  };
});

server.get("/api/storefront", async () => {
  const storefront = await readStorefront();

  return storefront;
});

server.put("/api/storefront", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  const body = request.body as Partial<StoredStorefront>;

  if (
    !Array.isArray(body.slides) ||
    !Array.isArray(body.promoCards)
  ) {
    reply.status(400);
    return { message: "Conteúdo da vitrine inválido." };
  }

  const storefront: StoredStorefront = {
    slides: body.slides,
    promoCards: body.promoCards,
    updatedAt: new Date().toISOString()
  };

  await saveStorefront(storefront);

  return storefront;
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
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

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
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

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
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

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

server.post("/api/products/reset", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  await saveCatalogProducts(products);

  return { items: products };
});

server.get("/api/orders", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  const orders = await readOrders();

  return { items: orders };
});

server.get("/api/me/orders", async (request, reply) => {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    reply.status(401);
    return { message: "Faça login para ver suas compras." };
  }

  const orders = await readOrders();
  const items = orders.filter(
    (order) => order.customer.email.toLowerCase() === user.email.toLowerCase()
  );

  return { items };
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
    deliveryMethod?: "delivery" | "pickup" | "combine";
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
    deliveryMethod:
      body.deliveryMethod === "delivery" || body.deliveryMethod === "pickup"
        ? body.deliveryMethod
        : "combine",
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
    totalInCents: safeItems.reduce((total, item) => total + item.subtotalInCents, 0),
    internalNotes: "",
    statusHistory: [
      {
        status: "pending_payment",
        changedAt: new Date().toISOString(),
        changedBy: "checkout"
      }
    ]
  };

  await saveOrder(order);

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
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  const params = request.params as { id: string };
  const orders = await readOrders();
  const order = orders.find((item) => item.id === params.id);

  if (!order) {
    reply.status(404);
    return { message: "Pedido não encontrado." };
  }

  return { order };
});

server.put("/api/orders/:id/status", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  const params = request.params as { id: string };
  const body = request.body as { status?: StoredOrder["status"] };
  const validStatuses: StoredOrder["status"][] = [
    "pending_payment",
    "paid",
    "in_production",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (!body.status || !validStatuses.includes(body.status)) {
    reply.status(400);
    return { message: "Status inválido." };
  }

  const orders = await readOrders();
  const order = orders.find((item) => item.id === params.id);

  if (!order) {
    reply.status(404);
    return { message: "Pedido não encontrado." };
  }

  const nextOrder = {
    ...order,
    status: body.status,
    statusHistory: [
      ...(order.statusHistory ?? []),
      {
        status: body.status,
        changedAt: new Date().toISOString(),
        changedBy: admin.email
      }
    ]
  };
  await saveOrder(nextOrder);

  return { order: nextOrder };
});

server.put("/api/orders/:id/notes", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

  const params = request.params as { id: string };
  const body = request.body as { internalNotes?: string };
  const orders = await readOrders();
  const order = orders.find((item) => item.id === params.id);

  if (!order) {
    reply.status(404);
    return { message: "Pedido não encontrado." };
  }

  const nextOrder = {
    ...order,
    internalNotes: String(body.internalNotes ?? "").slice(0, 2000)
  };
  await saveOrder(nextOrder);

  return { order: nextOrder };
});

server.post("/api/ai/product-description", async (request, reply) => {
  const admin = await requireAdmin(request, reply);

  if (!admin) {
    return { message: "Acesso negado." };
  }

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
const isDirectRun =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  server
    .listen({
      port,
      host
    })
    .catch((error) => {
      server.log.error(error);
      process.exit(1);
    });
}
