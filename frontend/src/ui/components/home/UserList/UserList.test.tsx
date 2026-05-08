import { screen } from '@testing-library/react';
import { renderWithStore } from '@/test/testUtils';
import type { User } from '@/services/user/user-service';
import { homeReducer } from '@/store/home/homeSlice';
import { UserList } from './UserList';
import { buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import { buildHomePreloadedState } from '@/test/store/home/__fixtures__/homeComponentState';
import { getAxiosMocks } from '@/test/utils/axiosMock';

jest.mock('axios');

describe('UserList', () => {
  it('renders users after load and opens create-user modal', async () => {
    const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
    const { get } = getAxiosMocks();
    get.mockResolvedValueOnce({
      data: { data: [user], meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null } },
    });

    renderWithStore(<UserList />, {
      reducer: { home: homeReducer },
      preloadedState: buildHomePreloadedState(),
    });

    expect(await screen.findByText('Ana')).toBeInTheDocument();
  });
});
