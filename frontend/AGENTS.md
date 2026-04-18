Frontend Architecture Notes

This frontend follows a domain-first React architecture with small, focused pieces.

Core rules:

- Keep components small and single-purpose.
- Prefer colocating template and composable/hook files in the same domain folder.
- Group state by domain, not by UI widget.
- Avoid one `useState` per field when the data belongs to the same context.
- Split cross-domain state into separate stores or slices only when the ownership is clear.
- Keep shared coordination in the store when multiple components need the same state.
- Use Redux Toolkit for shared app state and side effects.
- Keep React components mostly declarative and move orchestration into hooks or store actions.
- Use dependency injection for services so API access stays isolated from UI code.
- Use Axios only inside services, never directly in components.
- Validate API payloads with Zod at the service boundary.
- Handle API `204 No Content` responses explicitly in the service layer.
- Show user feedback for request failures with a global toast/snackbar pattern.

Domain structure:

- `src/ui/pages/<feature>/` contains feature-local components, hooks, and types.
- `src/services/<domain>/` contains API services for that domain.
- `src/store/<feature>/` contains shared state, thunks, and reducers for that feature.
- `src/shared/di/` contains container wiring and dependency registration.

Component guidance:

- Prefer `template + hook` in the same feature folder when the hook is only used there.
- Extract repeated list items, cards, and form controls into their own files.
- Pass grouped props instead of many unrelated props.
- Keep presentational components unaware of API details and store internals when possible.

State guidance:

- Keep all user-related state together in one user object or slice.
- Keep all movie-related state together in one movie object or slice.
- Derive UI state from the store instead of duplicating it locally.
- Use selectors and actions to keep components thin.

Request handling:

- Centralize loading, error, and success handling in the store or service layer.
- Clear transient form state after successful actions.
- Treat idempotent operations explicitly in the UI so repeated requests do not confuse the user.

Testing guidance:

- Test slices, services, and hooks at the boundary of their responsibility.
- Mock services in UI tests.
- Prefer testing behavior over implementation details.

