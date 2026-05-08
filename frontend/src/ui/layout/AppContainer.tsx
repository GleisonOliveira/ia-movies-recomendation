import { Alert, Box, Container, Snackbar, Stack, Typography } from '@mui/material';
import { HomeTemplate } from '@/ui/components/home/HomeTemplate/HomeTemplate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeToast } from '@/store/home/homeSlice';

export function AppContainer() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.home.toast);

  return (
    <Box sx={{ minHeight: '100vh', py: 6, backgroundColor: 'var(--app-bg-0)' }}>
      <Container maxWidth="lg">
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
            <HomeTemplate />
          </Box>
        </Stack>
      </Container>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => dispatch(closeToast())}>
        <Alert severity={toast.severity} variant="filled" onClose={() => dispatch(closeToast())}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
