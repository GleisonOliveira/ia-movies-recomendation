import { createContext, useContext } from 'react';
import type { User } from '@/services/user/UserService';

export type HomeSelectionContextValue = {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
};

export const HomeSelectionContext = createContext<HomeSelectionContextValue | null>(null);

export function useHomeSelection() {
  const value = useContext(HomeSelectionContext);
  if (!value) throw new Error('HomeSelectionContext not found');
  return value;
}
