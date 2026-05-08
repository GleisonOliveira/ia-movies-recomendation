import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeTemplate } from './HomeTemplate';
import type { User } from '@/services/user/user-service';
import { renderWithStore } from '@/test/testUtils';
import { userReducer } from '@/store/users/usersSlice';
import { buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import { buildHomePreloadedState } from '@/test/store/home/__fixtures__/homeComponentState';
import { getAxiosMocks } from '@/test/utils/axiosMock';

jest.mock('axios');

describe('HomeTemplate', () => {
  it('renders the users section and opens the create user modal', async () => {
    const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });

    const userHelpers = userEvent.setup();
    const { get } = getAxiosMocks();
    get.mockResolvedValueOnce({
      data: { data: [user], meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null } },
    });

    renderWithStore(<HomeTemplate />, {
      reducer: { home: userReducer },
      preloadedState: buildHomePreloadedState({
        userState: { loading: true },
      }),
    });

    expect(await screen.findByRole('button', { name: 'Novo usuário' })).toBeInTheDocument();
    expect(await screen.findByText('Ana')).toBeInTheDocument();

    await userHelpers.click(screen.getByRole('button', { name: 'Novo usuário' }));
    expect(await screen.findByText('Cadastrar novo usuário')).toBeInTheDocument();
  });
});
