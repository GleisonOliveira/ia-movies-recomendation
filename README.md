# movies-recomendation

Projeto fullstack para **recomendações de filmes**, com uma API em **NestJS (TypeScript)** e um front-end em **React (Vite)**.

A API integra:
- **TMDB** (buscar dados/metadata de filmes)
- **Postgres** (persistência via Prisma)
- **Neo4j** (grafo)
- (e também módulos de vetorização/ML usados para recomendação, conforme o código da API)

O front consome a API via `VITE_API_URL` e mostra imagens via `VITE_TMDB_IMAGE_PATH`.

## Requisitos

- Docker e Docker Compose (recomendado)
- Node.js (se quiser rodar sem Docker)

## Configurar variáveis de ambiente

Existem exemplos prontos:
- `api/.env.example`
- `frontend/.env.example`
- `.env` na raiz (usado pelo `docker-compose.yml`)

### TMDB

Defina `TMDB_TOKEN`, `TMDB_BASE_URL` (raiz `.env` ou `api/.env`).

### Banco Postgres

Defina:
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`

(raiz `.env` ou `api/.env`)

### Neo4j

Defina:
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `NEO4J_DATABASE`

(a porta fica fixa em `7687` no `docker-compose.yml`, e o container da API recebe `NEO4J_HOST=neo4j` e `NEO4J_PORT=7687` automaticamente)

### Frontend

Defina no `frontend/.env` (ou copie do `.env.example`):
- `VITE_API_URL` (padrão `http://localhost:3000`)
- `VITE_TMDB_IMAGE_PATH` (padrão `https://image.tmdb.org/t/p/w500/`)

## Rodar com Docker (recomendado)

1. Configure o arquivo `.env` na raiz (TMDB/Postgres/Neo4j). Ele será usado pelo `docker-compose.yml`.
2. Suba tudo:

```bash
rtk docker compose up --build
```

Depois:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Postgres: `localhost:${POSTGRES_PORT}`
- Neo4j: `http://localhost:7474` (web) e `bolt://localhost:7687`

## Rodar localmente (sem Docker)

### Backend (API)

```bash
cd api
rtk npm install
cp .env.example .env
rtk npm run start:dev
```

A API roda na porta `3000` (conforme `API_URL`/`start:dev` no código).

### Frontend

```bash
cd frontend
rtk npm install
cp .env.example .env
rtk npm run dev -- --host 0.0.0.0
```

- Frontend: `http://localhost:5173`

## Documentação da API (Swagger)

Com a API rodando, acesse: `http://localhost:3000/docs`

## Comandos do Backend (CLI)

Os comandos são executados via `nest-commander` dentro do diretório `api/`.

### Sincronizar filmes do TMDB

Busca filmes da API do TMDB e persiste no Postgres. Só insere filmes ainda não existentes; usa a data de lançamento mais recente no banco como ponto de partida.

```bash
cd api
npm run command:tmdb-database-sync
```

### Treinar modelo neural

Treina o modelo de recomendação (Two Tower) com os filmes do banco de dados.

```bash
cd api
npm run command:movie-neural-train
```

### Gerar embeddings de filmes

Gera e armazena os embeddings dos filmes usando o encoder treinado. Deve ser executado **após** o treinamento (`command:movie-neural-train`).

```bash
cd api
npm run command:movie-neural-embed
```

### Fluxo recomendado (primeira execução)

```bash
cd api
npm run command:tmdb-database-sync   # 1. Popula banco com filmes do TMDB
npm run command:movie-neural-train   # 2. Treina o modelo
npm run command:movie-neural-embed   # 3. Gera embeddings para recomendação
```

## Outros scripts do Backend

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila o projeto |
| `npm run start` | Inicia em produção (requer build) |
| `npm run start:dev` | Inicia com watch + debug na porta `9229` |
| `npm run start:prod` | Inicia via `dist/main` |
| `npm run test` | Roda testes unitários |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:cov` | Testes com cobertura |
| `npm run test:e2e` | Testes end-to-end |
| `npm run lint` | Lint + auto-fix |
| `npm run typecheck` | Verificação de tipos sem emitir arquivos |
| `npm run prisma-migrate-dev` | Cria e aplica migration (`init`) |
| `npm run prisma-generate` | Gera o Prisma Client |
