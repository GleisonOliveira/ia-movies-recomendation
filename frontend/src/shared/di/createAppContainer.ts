import { createHttpClient } from '@/services/http/httpClient';
import { MovieService } from '@/services/movie/MovieService';
import { UserService } from '@/services/user/UserService';

export function createAppContainer() {
  const apiUrl =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/:\d+$/, ':3000')
      : 'http://localhost:3000';
  const httpClient = createHttpClient(apiUrl);

  return {
    movieService: new MovieService(httpClient),
    userService: new UserService(httpClient),
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;
