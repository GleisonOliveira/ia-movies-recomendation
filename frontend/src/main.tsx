import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';

// Provide Vite env values to non-Vite contexts (e.g. Jest/ts-jest typechecking).
// Tests usually don't import `main.tsx`, but the app build still uses Vite.
(globalThis as unknown as { __VITE_ENV__?: unknown }).__VITE_ENV__ = import.meta.env;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
