Frontend Architecture (React, domain-first)

Code Context Optimization Rules: 
 The agent MUST avoid reading raw files whenever possible.
 Whenever the agent needs to read a file, it MUST use the available skill: read_clean_file
 The agent MUST NEVER read files directly.
 The agent must Call the skill `skills/read-clean-file/SKILL.md` and analyze the returned compacted code
 Before reading any file:
    1. Do I need this file?
    2. Can I request only a part of it?
    3. If yes → request specific section
    4. If no → use `skills/read-clean-file/SKILL.md`
 When analyzing code, prioritize: Function signatures, Control flow, Dependencies, Side effects
 Ignore Formatting, Comments, Non-essential structure
 Minimize token usage
 Avoid redundant reads
 Reuse previous context
 Never load unnecessary data
 Avoid raw file access
 Work with compacted code by default
 Request minimal additional context when needed

Principles:
 Small, single-purpose components
 Colocate components, hooks, and types per feature
 Group state by domain (not UI)
 Avoid multiple useState for same context
 Split state only when ownership is clear
 Keep shared state in store
 Prefer declarative components; move logic to hooks/store

State & Data:
 Use Redux Toolkit for global state
 Keep domain slices (user, movie, etc.)
 Derive UI state from store (avoid duplication)
 Use selectors and actions

Services:
 Use DI for services
 Axios only in services
 Validate payloads with Zod
 Handle 204 responses explicitly

Structure:
 src/ui/pages/<feature> → components/hooks/types
 src/services/<domain> → API services
 src/store/<feature> → slices/thunks
 src/shared/di → DI container

Components:
 Prefer template + hook per feature
 Extract reusable UI parts
 Pass grouped props
 Keep UI decoupled from API/store

Requests:
 Centralize loading/error/success
 Clear form state after success
 Handle idempotency in UI

Testing:
 Test slices/services/hooks
 Mock services in UI tests
 Prefer behavior over implementation