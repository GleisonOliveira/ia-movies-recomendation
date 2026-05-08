import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCreateForm } from './UserCreateForm';
import { renderWithStore } from '@/test/testUtils';
import { homeReducer } from '@/store/home/homeSlice';
import { buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import { buildHomePreloadedState } from '@/test/store/home/__fixtures__/homeComponentState';
import { getAxiosMocks } from '@/test/utils/axiosMock';

jest.mock('axios');

describe('UserCreateForm', () => {
  it('submits the new user payload', async () => {
    const user = userEvent.setup();
    const { post } = getAxiosMocks();
    post.mockResolvedValueOnce({
      data: buildUser({ name: 'Carla', age: 29 }),
      status: 201,
    });

    renderWithStore(<UserCreateForm />, {
      reducer: { home: homeReducer },
      preloadedState: buildHomePreloadedState({ createUserModal: { open: true } }),
    });

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Carla');
    await user.type(screen.getByRole('spinbutton', { name: 'Idade' }), '29');
    await user.click(screen.getByRole('button', { name: 'Cadastrar usuário' }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Cadastrar usuário' })).toBeEnabled();
  });
});
