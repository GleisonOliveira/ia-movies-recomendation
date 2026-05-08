import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { AppContainer } from '@/ui/layout/AppContainer';
import { UsersTemplate } from '@/ui/pages/UsersTemplate/UsersTemplate';
import { MoviesPage } from '@/ui/pages/MoviesPage/MoviesPage';

const rootRoute = createRootRoute({
  component: AppContainer,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: UsersTemplate,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'users',
  component: UsersTemplate,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'movies',
  component: MoviesPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, usersRoute, moviesRoute]);

export const router = createRouter({ routeTree });
