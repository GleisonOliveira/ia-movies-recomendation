import { RouterProvider } from '@tanstack/react-router';
import { router } from './routerConfig';

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}

