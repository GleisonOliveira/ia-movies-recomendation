import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { resetHomeState } from '@/store/users/usersSlice';
import { HomeTemplate } from '@/ui/components/home/HomeTemplate/HomeTemplate';

export function UsersPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetHomeState());
  }, [dispatch]);

  return <HomeTemplate />;
}
