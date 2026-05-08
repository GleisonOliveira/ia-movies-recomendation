import { Alert, Box, Button, Card, CardContent, Pagination, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MovieReadCard } from '../MovieReadCard/MovieReadCard';
import { useMoviePage } from './useMoviePage';
import { useAppDispatch } from '@/store/hooks';
import { setToast } from '@/store/users/usersSlice';
import { useEffect } from 'react';
import { Loading } from '@/ui/components/home/_shared/Loading/Loading';

export function MoviePage() {
  const dispatch = useAppDispatch();
  const { loading, error, data, meta, page, localQuery, setLocalQuery, canSubmit, onSubmitSearch, onRetry, onChangePage } = useMoviePage();

  useEffect(() => {
    if (!error) return;
    dispatch(setToast({ open: true, message: error, severity: 'error' }));
  }, [dispatch, error]);

  return (
    <Stack spacing={3}>
      <Card sx={{ backgroundColor: 'var(--app-bg-1)', border: '1px solid var(--app-border)' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" color="primary">
                Filmes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Busque e navegue
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listagem somente leitura com paginação e busca pelo nome.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 420 } }}>
              <TextField
                fullWidth
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Digite o nome do filme"
                size="medium"
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={!canSubmit || loading}
                onClick={() => {
                  onSubmitSearch();
                }}
              >
                Buscar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
