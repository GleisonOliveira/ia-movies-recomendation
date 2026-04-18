Frontend Architecture (React, domain-first)

Principles:
- Small, single-purpose components
- Colocate components, hooks, and types per feature
- Group state by domain (not UI)
- Avoid multiple useState for same context
- Split state only when ownership is clear
- Keep shared state in store
- Prefer declarative components; move logic to hooks/store

State & Data:
- Use Redux Toolkit for global state
- Keep domain slices (user, movie, etc.)
- Derive UI state from store (avoid duplication)
- Use selectors and actions

Services:
- Use DI for services
- Axios only in services
- Validate payloads with Zod
- Handle 204 responses explicitly

Structure:
- src/ui/pages/<feature> → components/hooks/types
- src/services/<domain> → API services
- src/store/<feature> → slices/thunks
- src/shared/di → DI container

Components:
- Prefer template + hook per feature
- Extract reusable UI parts
- Pass grouped props
- Keep UI decoupled from API/store

Requests:
- Centralize loading/error/success
- Clear form state after success
- Handle idempotency in UI

Testing:
- Test slices/services/hooks
- Mock services in UI tests
- Prefer behavior over implementation