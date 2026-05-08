import { configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppContainer } from './AppContainer';
import { userReducer, createInitialHomeState } from '@/store/users/usersSlice';
import { moviesReducer, createInitialMoviesState } from '@/store/movies/moviesSlice';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';

jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/users' }),
    Outlet: () => null,
  };
});

describe('AppContainer Snackbar', () => {
  function mkStore(preloadedHome: ReturnType<typeof createInitialHomeState>, preloadedMovies: ReturnType<typeof createInitialMoviesState>) {
    return configureStore({
      reducer: { home: userReducer, movies: moviesReducer, sidenav: sidenavReducer },
      preloadedState: { home: preloadedHome, movies: preloadedMovies },
    });
  }

  it('renders toast message from store and has no close action button', () => {
    const home = createInitialHomeState();
    home.toast = { open: true, message: 'Erro de teste', severity: 'error' };
    const movies = createInitialMoviesState();

    const store = mkStore(home, movies);

    render(
      <Provider store={store}>
        <AppContainer />
      </Provider>,
    );

    expect(screen.getByText('Erro de teste')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fechar|close/i })).not.toBeInTheDocument();
  });
});
