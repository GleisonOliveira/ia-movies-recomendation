import { useState, type PropsWithChildren } from 'react';
import type { User } from '@/services/user/UserService';
import { HomeSelectionContext } from './HomeSelectionContext';

export function HomeSelectionProvider({ children }: PropsWithChildren) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <HomeSelectionContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
      }}
    >
      {children}
    </HomeSelectionContext.Provider>
  );
}
