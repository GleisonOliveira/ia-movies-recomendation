import { useContext } from 'react';
import { AppContainerContext } from './AppContainerContext';

export function useAppContainer() {
  const container = useContext(AppContainerContext);
  if (!container) throw new Error('AppContainerContext not found');
  return container;
}
