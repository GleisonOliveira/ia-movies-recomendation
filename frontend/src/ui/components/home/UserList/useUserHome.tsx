import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadUsers, setSelectedUser, setUsersPage } from '@/store/users/usersSlice';

export function useUserHome() {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.home.userState);
  const selectedUser = useAppSelector((state) => state.home.selectedUser);

  useEffect(() => {
    void dispatch(loadUsers(userState.page));
  }, [dispatch, userState.page]);

  return {
    userState: {
      ...userState,
      selectedUser,
    },
    userActions: {
      setUsersPage: (page: number) => dispatch(setUsersPage(page)),
      openUserDrawer: (user: Parameters<typeof setSelectedUser>[0]) => dispatch(setSelectedUser(user)),
    },
  };
}
