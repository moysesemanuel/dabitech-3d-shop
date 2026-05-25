# E-commerce 3D

Base inicial para um e-commerce de produtos 3D com foco em visual moderno, catálogo rápido e arquitetura simples de evoluir.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Fastify + TypeScript
- Estrutura: monorepo com `npm workspaces`

## Estrutura

```text
apps/
  api/  -> catálogo, categorias e rotas iniciais
  web/  -> landing page + vitrine de produtos
```

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Em um terminal, suba a API:

```bash
npm run dev:api
```

3. Em outro terminal, suba o frontend:

```bash
npm run dev:web
```

4. Abra o frontend em `http://127.0.0.1:3010`.

## Variáveis

Crie um `.env` local a partir de `.env.example`.

No backend, configure o Neon com:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/dbname?sslmode=require"
```

Sem `DATABASE_URL`, a API usa arquivos JSON locais apenas para desenvolvimento.

No frontend, você pode apontar a API com:

```bash
VITE_API_URL=http://127.0.0.1:4020
```

Para Vercel, configure `VITE_API_URL` com a URL pública da API e mantenha
`DATABASE_URL` no ambiente onde a API estiver rodando.

## Rotas da API

- `GET /health`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/orders`

## Próximos passos recomendados

- Criar deploy da API em ambiente Node persistente ou serverless
- Persistir carrinho e favoritos
- Integrar pagamentos com Stripe ou Mercado Pago
- Subir assets reais dos produtos 3D e galeria por variante

## Sugestão de backend

Para começar, `Fastify` é uma boa escolha porque é leve, rápido e simples de manter. Se o projeto crescer para uma operação com módulos mais rígidos, auth complexo, filas e múltiplos times, a migração natural seria para `NestJS` mantendo TypeScript e boa parte dos conceitos.
