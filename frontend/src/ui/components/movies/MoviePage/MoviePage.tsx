import { Alert, Box, Button, Pagination, Stack, Typography } from '@mui/material';
import { MovieReadCard } from '../MovieReadCard/MovieReadCard';
import { useMoviePage } from './useMoviePage';
import { useAppDispatch } from '@/store/hooks';
import { setToast } from '@/store/users/usersSlice';
import { useEffect } from 'react';
import { Loading } from '@/ui/components/home/_shared/Loading/Loading';
import { MovieSearchCard } from './MovieSearchCard';

export function MoviePage() {
  const dispatch = useAppDispatch();
  const { loading, error, data, meta, page, onRetry, onChangePage } = useMoviePage();

  useEffect(() => {
    if (!error) return;
    dispatch(setToast({ open: true, message: error, severity: 'error' }));
  }, [dispatch, error]);

  return (
    <Stack spacing={3}>
      <MovieSearchCard
        
      />

      {error ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
            >
              Tentar novamente
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}
      {loading ? <Loading minHeight="45vh" testId="movies-loading" /> : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
              xl: 'repeat(6, minmax(0, 1fr))',
            },
          }}
        >
          {data.map((movie) => <MovieReadCard key={movie.id} movie={movie} />)}
          {data.length === 0 ? (
            <Box
              sx={{
                gridColumn: '1 / -1',
                color: 'text.secondary',
                display: 'grid',
                placeItems: 'center',
                minHeight: '20vh',
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'var(--app-surface-2)',
              }}
            >
              <Typography variant="body2">Nenhum filme encontrado</Typography>
            </Box>
          ) : null}
        </Box>
      )}

      {meta ? (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            count={meta.last_page}
            onChange={(_, nextPage) => {
              onChangePage(nextPage);
            }}
          />
        </Box>
      ) : null}
    </Stack>
  );
}
