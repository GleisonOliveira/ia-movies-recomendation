import { Stack } from '@mui/material';
import { UserList } from './UserList';
import { UserDrawer } from './UserDrawer';

export function HomeTemplate() {
  return (
    <Stack spacing={3}>
      <UserList />
      <UserDrawer />
    </Stack>
  );
}
