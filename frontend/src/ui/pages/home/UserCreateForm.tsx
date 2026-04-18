import { Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  closeCreateUserModal,
  setCreateUserAge,
  setCreateUserName,
  submitCreateUserModal,
} from '@/store/home/homeSlice';

export function UserCreateForm() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.home.createUserModal);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(submitCreateUserModal());
  };

  return (
    <>
      <DialogTitle>Cadastrar novo usuário</DialogTitle>
      <DialogContent>
        <Stack spacing={2} component="form" id="create-user-form" onSubmit={handleSubmit} noValidate sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados para incluir um novo usuário na lista.
          </Typography>
          <TextField
            label="Nome"
            value={modal.name}
            onChange={(event) => dispatch(setCreateUserName(event.target.value))}
            fullWidth
            autoFocus
            error={Boolean(modal.errors.name)}
            helperText={modal.errors.name ?? ' '}
          />
          <TextField
            label="Idade"
            value={modal.age}
            onChange={(event) => dispatch(setCreateUserAge(event.target.value))}
            type="number"
            fullWidth
            error={Boolean(modal.errors.age)}
            helperText={modal.errors.age ?? ' '}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(closeCreateUserModal())} disabled={modal.submitting}>
          Cancelar
        </Button>
        <Button type="submit" form="create-user-form" variant="contained" disabled={modal.submitting}>
          {modal.submitting ? 'Salvando...' : 'Cadastrar usuário'}
        </Button>
      </DialogActions>
    </>
  );
}
