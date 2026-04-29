import { createHttpClient } from '@/services/http/httpClient';
import { MovieService } from '@/services/movie/MovieService';
import { UserService } from '@/services/user/UserService';
import { env } from '@/config/env';

export function createAppContainer() {
  const httpClient = createHttpClient(env.API_URL);

  return {
    movieService: new MovieService(httpClient),
    userService: new UserService(httpClient),
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;
