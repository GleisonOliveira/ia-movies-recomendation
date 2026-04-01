# Copilot Instructions for Movies Recommendation API

## Overview
This document provides guidelines for AI agents working on the Movies Recommendation API project. It includes conventions, build/test commands, architecture decisions, and potential pitfalls to ensure productive contributions.

---

## Build and Test Commands

### Development
- **Install dependencies:** `npm install`
- **Start development server:** `npm run start:dev`
- **Build project:** `npm run build`
- **Generate Prisma types:** `npm run prisma-generate`

### Testing
- **Run unit tests:** `npm run test`
- **Run e2e tests:** `npm run test:e2e`
- **Check test coverage:** `npm run test:cov`

### CLI Commands
- **Sync TMDB database:** `npm run command:tmdb-database-sync`

---

## Architecture and Conventions

### Layered Architecture
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Business logic layer.
- **Repositories:** Database access layer using Prisma ORM.

### Module Organization
- Domain-driven structure: `user`, `movie`, `recomendation`, `connectors`, `command`, `prisma`.
- Global modules: `ConfigModule`, `PrismaModule`.

### DTO Conventions
- Use `class-transformer` and `class-validator` decorators.
- Include `toModel()` methods for Prisma input conversion.
- Example: [user.create.dto.ts](../src/modules/user/dto/user.create.dto.ts).

### Response Format
- Standardized paginated responses with meta structure.
- Example: [abstract-list-response.dto.ts](../src/modules/responses/abstract-list-response.dto.ts).

### Path Aliases
- `@/*` → `src/*`
- `@/generated*` → `generated/prisma/`

---

## Potential Pitfalls

### Prisma Setup
- **Dynamic DB Connection:** Ensure `.env` contains correct Postgres credentials.
- **Schema Changes:** Run `npm run prisma-generate` after modifying `schema.prisma`.

### Migrations
- Use `npm run prisma-migrate-dev --name <name>` interactively.
- Commit resulting SQL files in `prisma/migrations/`.

### Testing
- Existing tests are minimal; expand coverage where possible.

---

## Key Files

| Pattern               | File                                                                 |
|-----------------------|----------------------------------------------------------------------|
| **REST Endpoints**    | [user.controller.ts](../src/modules/user/user.controller.ts)         |
| **Service Layer**     | [user-service.ts](../src/modules/user/service/user-service/user-service.ts) |
| **Repository Access** | [user-repository.ts](../src/modules/user/repository/user-repository.ts) |
| **CLI Commands**      | [tmdb-database-sync-command.ts](../src/modules/command/tmdb/tmdb-database-sync/tmdb-database-sync-command.ts) |
| **Database Schema**   | [schema.prisma](../prisma/schema.prisma)                             |

---

## Example Prompts

- "Add a new endpoint to fetch movies by genre."
- "Fix the Prisma schema to include a new `Review` model."
- "Write unit tests for the `user-service.ts`."
- "Generate a CLI command to sync movie ratings from TMDB."

---

## Next Steps
Consider creating additional agent customizations for:
- **Testing:** Automate test generation and coverage analysis.
- **Prisma:** Validate schema changes and automate migrations.
- **CLI Commands:** Streamline creation of new commands using nest-commander.
