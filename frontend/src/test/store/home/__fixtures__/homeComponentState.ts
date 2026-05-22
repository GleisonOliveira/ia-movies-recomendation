import type { HomeState } from '@/store/users/usersSlice';
import { createInitialHomeState } from '@/store/users/usersSlice';

type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? PartialDeep<T[K]>
      : T[K];
};

export function buildHomePreloadedState(overrides: PartialDeep<HomeState> = {}) {
  const base: HomeState = createInitialHomeState();
  return {
    home: {
      ...base,
      ...(overrides as PartialDeep<HomeState>),
      userState: {
        ...base.userState,
        ...(overrides.userState ?? {}),
      },
      movieState: {
        ...base.movieState,
        ...(overrides.movieState ?? {}),
        userMovies: {
          ...base.movieState.userMovies,
          ...(overrides.movieState?.userMovies ?? {}),
        },
        recommendations: {
          ...base.movieState.recommendations,
          ...(overrides.movieState?.recommendations ?? {}),
        },
      },
      createUserModal: {
        ...base.createUserModal,
        ...(overrides.createUserModal ?? {}),
      },
      toast: {
        ...base.toast,
        ...(overrides.toast ?? {}),
      },
    },
  };
}
