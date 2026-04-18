import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCreateForm } from './UserCreateForm';

const dispatch = jest.fn();

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (state: {
      home: {
      createUserModal: { open: boolean; name: string; age: string; submitting: boolean; errors: { name: string | null; age: string | null } };
      userState: { page: number };
    };
  }) => unknown) =>
    selector({
      home: {
        createUserModal: { open: true, name: '', age: '', submitting: false, errors: { name: null, age: null } },
        userState: { page: 1 },
      },
    }),
}));

jest.mock('@/store/home/homeSlice', () => ({
  createUser: jest.fn((payload) => ({ type: 'home/createUser', payload })),
  closeCreateUserModal: jest.fn(() => ({ type: 'home/closeCreateUserModal' })),
  loadUsers: jest.fn((page) => ({ type: 'home/loadUsers', payload: page })),
  setCreateUserAge: jest.fn((value) => ({ type: 'home/setCreateUserAge', payload: value })),
  setCreateUserName: jest.fn((value) => ({ type: 'home/setCreateUserName', payload: value })),
  submitCreateUserModal: jest.fn(() => ({ type: 'home/submitCreateUserModal' })),
}));

describe('UserCreateForm', () => {
  it('submits the new user payload', async () => {
    const user = userEvent.setup();

    render(<UserCreateForm />);

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Carla');
    await user.type(screen.getByRole('spinbutton', { name: 'Idade' }), '29');
    await user.click(screen.getByRole('button', { name: 'Cadastrar usuário' }));

    expect(dispatch).toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: 'Cadastrar usuário' })).toBeEnabled();
  });
});
