import { screen } from '@testing-library/react';
import { MoviePage } from './MoviePage';
import { moviesReducer, createInitialMoviesState } from '@/store/movies/moviesSlice';
import { userReducer, createInitialHomeState } from '@/store/users/usersSlice';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';
import { renderWithStore } from '@/test/testUtils';
import { getAxiosMocks } from '@/test/utils/axiosMock';

jest.mock('axios');

describe('MoviePage', () => {
  it('renders loading spinner while movies are loading', () => {
    const { get } = getAxiosMocks();
    get.mockReturnValue(new Promise(() => {}));

    renderWithStore(<MoviePage />, {
      reducer: { movies: moviesReducer, home: userReducer, sidenav: sidenavReducer },
      preloadedState: {
        movies: { ...createInitialMoviesState(), loading: false, data: [], meta: null, page: 1, query: '' },
        home: createInitialHomeState(),
        sidenav: { open: false, activeKey: 'movies' },
      },
    });

    expect(screen.getByTestId('movies-loading')).toBeInTheDocument();
  });
});
