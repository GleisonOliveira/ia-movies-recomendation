import { render, screen } from '@testing-library/react';
import { HomeTemplate } from './HomeTemplate';
import type { User } from '@/services/user/user-service';

const user: User = { id: 1, name: 'Ana', age: 28 };

jest.mock('./useUserHome', () => ({
  useUserHome: () => ({
    userState: {
      loading: false,
      error: null,
      data: [user],
      meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null },
      page: 1,
      selectedUser: user,
    },
    userActions: {
      setUsersPage: jest.fn(),
      openUserDrawer: jest.fn(),
    },
  }),
}));

jest.mock('./useMovieHome', () => ({
  useMovieHome: () => ({
    movieState: {
      userMovies: { loading: false, error: null, data: [], meta: null },
      userMoviesPage: 1,
      query: '',
      options: [],
      loading: false,
      selected: null,
    },
    drawerOpen: false,
    movieActions: {
      openMovieDrawer: jest.fn(),
      closeDrawer: jest.fn(),
      setUserMoviesPage: jest.fn(),
      handleMovieQueryChange: jest.fn(),
      setSelectedMovieOption: jest.fn(),
      addMovieToUser: jest.fn(),
      removeMovieFromUser: jest.fn(),
    },
  }),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: (state: { home: { selectedUser: User; createUserModal: { open: boolean; errors: { name: string | null; age: string | null }; name: string; age: string; submitting: boolean } } }) => unknown) =>
    selector({
      home: {
        selectedUser: user,
        createUserModal: { open: false, errors: { name: null, age: null }, name: '', age: '', submitting: false },
      },
    }),
}));

describe('HomeTemplate', () => {
  it('renders the users section', () => {
    render(<HomeTemplate />);

    expect(screen.getByRole('button', { name: 'Novo usuário' })).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });
});
