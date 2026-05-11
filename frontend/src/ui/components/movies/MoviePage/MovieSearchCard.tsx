import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMovieQuery } from '@/store/movies/moviesSlice';
import { loadMovies } from '@/store/movies/moviesThunks';

export function MovieSearchCard() {
  const dispatch = useAppDispatch();
  const { loading, query } = useAppSelector((state) => state.movies);

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const canSubmit = useMemo(() => localQuery.trim().length > 0, [localQuery]);

  const handleChange = (value: string) => {
    setLocalQuery(value);
    // Quando o usuário limpar o input, resetamos o filtro imediatamente.
    if (value.trim().length === 0) {
      dispatch(setMovieQuery(''));
      dispatch(loadMovies({ page: 1, name: undefined }));
    }
  };

  const onClearSearch = () => {
    dispatch(setMovieQuery(''));
    dispatch(loadMovies({ page: 1, name: undefined }));
  };

  return (
    <Card sx={{ backgroundColor: 'var(--app-bg-1)', border: '1px solid var(--app-border)' }}>
      <CardContent>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
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
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1}
            sx={{
              width: '100%',
              flexWrap: { xs: 'wrap', lg: 'nowrap' },
              alignItems: { xs: 'stretch', lg: 'center' },
            }}
          >
            <TextField
              fullWidth
              value={localQuery}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Digite o nome do filme"
              size="medium"
              sx={{ flex: { xs: '1 1 auto', lg: '1 1 240px' } }}
            />
            <Button
              variant="contained"
              size="medium"
              startIcon={<SearchIcon />}
              disabled={!canSubmit || loading}
              onClick={() => {
                dispatch(setMovieQuery(localQuery));
              }}
              sx={{ whiteSpace: 'nowrap', minHeight: '56px', height: '56px', my: 'auto' }}
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              startIcon={<ClearIcon />}
              disabled={!canSubmit || loading}
              onClick={onClearSearch}
              sx={{ whiteSpace: 'nowrap', minHeight: '56px', height: '56px', my: 'auto' }}
            >
              Limpar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
