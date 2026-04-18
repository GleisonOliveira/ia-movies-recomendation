# AI Agent Instructions for the API Project

## Project Overview
This is a REST API for movie recommendations, built using NestJS and Prisma.

## Objective
The API provides personalized movie recommendations by leveraging data from online catalogs and training models based on this data.

## Architecture
- Modular NestJS framework.
- Prisma ORM for database interactions.
- Qdrant DB as the database.
- Domain-driven design with clear separation of concerns.

## General Rules
1. **Database Access**: 
   - Always access the database through repositories.
   - All database queries must be parameterized (no string concatenation).

2. **Business Logic**:
   - Business rules must reside in services.
   - Controllers should not contain any logic.

3. **Shared Interfaces**:
   - Place shared interfaces in the `interfaces` folder, following the hierarchical structure of the resource.

4. **Configuration Constants**:
   - Store configuration constants in the `constants` folder, following the hierarchical structure of the resource.

5. **Environment Variables**:
   - Secrets and configurations must be stored in `.env` files.

6. **DTOs**:
   - All requests with parameters must use DTOs for validation.
   - Responses must also use DTOs, preferably extending `AbstractListResponseDto` for lists.

7. **Pagination**:
   - Listing endpoints must always be paginated using `page` and `per_page`.
   - Use `createPaginator` for queries, always referencing Prisma-generated tables.

8. **Code Quality**:
   - Follow SOLID principles.
   - Always inject dependencies.
   - Write small, self-contained methods. If necessary, create separate classes or services to maintain the Single Responsibility Principle (SRP).

9. **Testing**:
   - Tests are mandatory. For new classes, generate tests and execute them with `npm run test`.

10. **Naming and Best Practices**:
    - Use descriptive names and adhere to best practices.
    - Table fields must use `snake_case` and include constraints for foreign keys.

11. **Async/Await**:
    - Use `async/await` for IO-heavy tasks.

12. **Module Organization**:
    - Repositories, services, classes, and DTOs related to a module must reside within the module.

13. **Prisma**:
    - Tables should use explicit relationships and constraints for relationships.
    - Tables should use laravel namings, like user_movies and user_movie_ratings tables.
    - Tables should use snake_case names

## Additional Notes
- Refer to `architecture-and-conventions.md` for detailed patterns and examples.
- Use the `@/generated` alias for Prisma imports.
- Follow the `prisma/schema.prisma` file for database schema changes.

## Agent Behavior

- Always analyze existing code before creating new files.
- Prefer modifying existing files instead of creating duplicates.
- Ask for clarification when requirements are ambiguous.
- Never break existing patterns or architecture.
- Follow project rules strictly, even if alternative solutions exist.

## Rule Priority

1. Architecture rules (highest priority)
2. Database rules
3. Code style rules (lowest priority)

## Pagination Pattern

Example:

```ts
const paginator = createPaginator({ perPage });

return paginator(model, {
  where: {},
  orderBy: { created_at: 'desc' }
});
```

## Testing Rules

- Use Jest
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test services, not controllers

## Response Format

All responses must follow:

{
  data: any,
  meta?: {
    total: number,
    page: number,
    lastPage: number
  }
}

## Anti-Patterns (Never do this)

- Do not access Prisma directly in controllers
- Do not create business logic in DTOs
- Do not duplicate logic across services
- Do not return raw database entities