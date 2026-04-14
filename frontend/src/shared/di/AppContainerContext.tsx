import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import { createAppContainer } from './createAppContainer';
import type { AppContainer } from './createAppContainer';

const AppContainerContext = createContext<AppContainer | null>(null);

export function AppContainerProvider({ children }: PropsWithChildren) {
  const container = createAppContainer();
  return (
    <AppContainerContext.Provider value={container}>
      {children}
    </AppContainerContext.Provider>
  );
}

export { AppContainerContext };
