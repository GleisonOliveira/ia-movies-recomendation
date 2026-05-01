import type { User } from '@/generatedprisma/client';

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'John',
    age: 30,
    ...overrides,
  };
}
