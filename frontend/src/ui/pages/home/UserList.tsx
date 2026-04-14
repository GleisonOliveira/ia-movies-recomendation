import { Alert, Box, Card, CardContent, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import { useUserHome } from './useUserHome';
import { UserListItem } from './UserListItem';

export function UserList() {
  const {
    userState: { loading: usersLoading, error: usersError, data: usersData, meta: usersMeta, page: usersPage },
    userActions: { setUsersPage, openUserDrawer },
  } = useUserHome();

  return (
    <Stack spacing={3}>
      {usersError ? <Alert severity="error">{usersError}</Alert> : null}
      {usersLoading ? (
        <Skeleton variant="rectangular" height={280} />
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Usuários
            </Typography>
            <Stack spacing={1.5}>
              {usersData.map((user) => (
                <UserListItem key={user.id} user={user} onClick={openUserDrawer} />
              ))}
            </Stack>
            {usersMeta ? (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  page={usersPage}
                  count={usersMeta.last_page}
                  color="primary"
                  onChange={(_, page) => setUsersPage(page)}
                />
              </Box>
            ) : null}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
