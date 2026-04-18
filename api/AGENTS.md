API Agent (NestJS + Prisma + Qdrant)

Objective:
- REST API for movie recommendations

Architecture:
- Modular NestJS
- Prisma ORM
- Qdrant
- DDD (clear boundaries)

Core Rules:
- DB access via repositories only
- No Prisma in controllers
- Business logic in services
- Controllers = no logic
- Use DTOs for request/response validation
- Use async/await for IO

State & Structure:
- Modules contain their own services/repos/dtos
- Shared interfaces → interfaces/
- Constants → constants/
- Env → .env

Database:
- Snake_case tables/fields
- Explicit relations + constraints
- Laravel-style naming (user_movies, etc.)
- Always parameterized queries

Pagination:
- Required on all list endpoints
- Use page + per_page
- Use createPaginator (Prisma models)

Responses:
{
  data: any,
  meta?: { total, page, lastPage }
}

Testing:
- Jest
- AAA pattern
- Mock external deps
- Test services (not controllers)
- Tests required

Agent Behavior:
- Read existing code first
- Prefer editing over creating
- Ask if unclear
- Do not break patterns

Anti-patterns:
- No Prisma in controllers
- No logic in DTOs
- No duplicated logic
- No raw DB responses

Priority:
1. Architecture
2. Database
3. Style

Refs:
- architecture-and-conventions.md
- prisma/schema.prisma
- @/generated (Prisma)