import { Stack } from '@mui/material';
import { UserList } from '../UserList/UserList';
import { UserDrawer } from '../UserDrawer/UserDrawer';

export function HomeTemplate() {
  return (
    <Stack spacing={3}>
      <UserList />
      <UserDrawer />
    </Stack>
  );
}
