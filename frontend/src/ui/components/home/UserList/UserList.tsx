import { Alert, Box, Button, Card, CardContent, Dialog, Pagination, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useUserHome } from './useUserHome';
import { UserListItem } from '../UserListItem/UserListItem';
import { UserCreateForm } from '../UserCreateForm/UserCreateForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCreateUserModal, closeCreateUserModal } from '@/store/users/usersSlice';
import { Loading } from '../_shared/Loading/Loading';

export function UserList() {
  const dispatch = useAppDispatch();
  const createOpen = useAppSelector((state) => state.home.createUserModal.open);
  const {
    userState: { loading: usersLoading, error: usersError, data: usersData, meta: usersMeta, page: usersPage },
    userActions: { setUsersPage, openUserDrawer },
  } = useUserHome();

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          backgroundColor: 'var(--app-bg-1)',
          border: '1px solid var(--app-border)',
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="overline" color="primary">
                Usuários
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Gerencie os cadastros
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crie perfis, navegue entre páginas e abra um usuário para ver os filmes associados.
              </Typography>
            </Box>
            <Button startIcon={<Add />} variant="contained" onClick={() => dispatch(openCreateUserModal())}>
              Novo usuário
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Dialog open={createOpen} onClose={() => dispatch(closeCreateUserModal())} fullWidth maxWidth="sm">
        <UserCreateForm />
      </Dialog>
      {usersError ? <Alert severity="error">{usersError}</Alert> : null}
      {usersLoading ? (
        <Loading minHeight="40vh" data-testId="users-loading" />
      ) : (
        <Card
          sx={{
            border: '1px solid var(--app-border)',
            backgroundColor: 'var(--app-bg-1)',
          }}
        >
          <CardContent>
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
