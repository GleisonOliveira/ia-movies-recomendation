import { Alert, Box, Container, Snackbar, Stack, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { SideNav } from '@/ui/components/layout/SideNav/SideNav';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeToast } from '@/store/users/usersSlice';
import { useEffect } from 'react';

export function AppContainer() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.home.toast);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (pathname !== '/users' && pathname !== '/movies') void navigate({ to: '/users' });
  }, [navigate, pathname]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Evita deslocar a sidenav/ações para baixo em telas pequenas.
        pt: { xs: 0, sm: 6 },
        pb: 6,
        backgroundColor: 'var(--app-bg-0)',
      }}
    >
      <Stack direction="row" spacing={3} sx={{ px: { xs: 0, sm: 2 }, alignItems: 'flex-start' }}>
        <SideNav />
        <Container maxWidth="lg" sx={{ flex: 1 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="overline" color="primary">
                Movies Recommendation
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Frontend em React com DI, Zod e Material UI
              </Typography>
            </Box>
            <Box>
              <Outlet />
            </Box>
          </Stack>
        </Container>
      </Stack>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          dispatch(closeToast());
        }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
