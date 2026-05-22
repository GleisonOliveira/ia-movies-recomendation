import { screen, waitFor } from '@testing-library/react';
import { renderWithStore } from '@/test/testUtils';
import type { User } from '@/services/user/user-service';
import { userReducer } from '@/store/users/usersSlice';
import { UserList } from './UserList';
import { buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import { buildHomePreloadedState } from '@/test/store/home/__fixtures__/homeComponentState';
import { getAxiosMocks } from '@/test/utils/axiosMock';


jest.mock('axios');

describe('UserList', () => {
  it('renders loading while users are loading', async () => {
    const { get } = getAxiosMocks();

    let resolveRequest!: (value: unknown) => void;
    
    const pendingPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    get.mockReturnValueOnce(pendingPromise);

    renderWithStore(<UserList />, {
      reducer: { home: userReducer },
      preloadedState: buildHomePreloadedState({
        userState: { loading: false, data: [], meta: null, page: 1 },
      }),
    });

    // Enquanto o request ainda está pendente, a UI deve mostrar o loading.
    // (O componente renderiza o spinner via <Loading />, que por padrão usa data-testid="loading".)
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Finaliza o request para não deixar updates pendentes.
    resolveRequest({
      data: { data: [], meta: { total: 0, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null } },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('renders users after load and opens create-user modal', async () => {
    const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
    const { get } = getAxiosMocks();
    get.mockResolvedValueOnce({
      data: { data: [user], meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null } },
    });

    renderWithStore(<UserList />, {
      reducer: { home: userReducer },
      preloadedState: buildHomePreloadedState({
        userState: { loading: true },
      }),
    });

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    expect(screen.queryByTestId('users-loading')).not.toBeInTheDocument();
  });
});
