import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

type AnyReducer = Parameters<typeof configureStore>[0]['reducer'];
type AnyPreloadedState = Parameters<typeof configureStore>[0]['preloadedState'];

export function createTestStore<TPreloadedState = unknown>(options: {
  reducer: AnyReducer;
  preloadedState?: TPreloadedState;
}) {
  return configureStore({
    reducer: options.reducer,
    preloadedState: options.preloadedState as unknown as AnyPreloadedState,
  });
}

export function renderWithStore(
  ui: ReactElement,
  opts: {
    preloadedState?: unknown;
    reducer: AnyReducer;
  },
) {
  const reducer = opts?.reducer;
  if (!reducer) {
    throw new Error('renderWithStore: opts.reducer is required');
  }

  const preloadedState = opts?.preloadedState;

  const store = createTestStore({
    reducer,
    preloadedState,
  });

  const rendered = render(
    <Provider store={store}>
      {ui}
    </Provider>,
  );
  return { store, ...rendered };
}
