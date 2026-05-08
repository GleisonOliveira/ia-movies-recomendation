import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { AppContainer } from '@/ui/layout/AppContainer';
import { UsersPage } from '@/ui/pages/UsersPage/UsersPage';
import { MoviesPage } from '@/ui/pages/MoviesPage/MoviesPage';

const rootRoute = createRootRoute({
  component: AppContainer,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: UsersPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'users',
  component: UsersPage,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'movies',
  component: MoviesPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, usersRoute, moviesRoute]);

export const router = createRouter({ routeTree });
