import { Alert, Box, Button, Drawer, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import { useMovieHome } from './useMovieHome';
import { MovieCard } from './MovieCard';
import { MovieSearch } from './MovieSearch';

export function UserDrawer() {
  const {
    movieState,
    drawerOpen,
    movieActions,
  } = useMovieHome();
  const { closeDrawer, setUserMoviesPage, removeMovieFromUser, handleMovieQueryChange, setSelectedMovieOption, addMovieToUser } = movieActions;
  const { userMovies, userMoviesPage, query, options, loading, selected } = movieState;

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
      <Box sx={{ width: { xs: 380, sm: 640, md: 920 }, p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Usuário</Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione um usuário
              </Typography>
            </Box>
            <Button onClick={closeDrawer}>Fechar</Button>
          </Stack>

          <MovieSearch
            movieState={{ query, options, loading, selected }}
            movieActions={{
              handleMovieQueryChange,
              setSelectedMovieOption,
              addMovieToUser,
            }}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Filmes associados
            </Typography>
            {userMovies.loading ? <Skeleton variant="rectangular" height={140} /> : null}
            {userMovies.error ? <Alert severity="error">{userMovies.error}</Alert> : null}
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              {userMovies.data.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onRemove={removeMovieFromUser} />
              ))}
            </Box>
            {userMovies.meta ? (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  page={userMoviesPage}
                  count={userMovies.meta.last_page}
                  onChange={(_, page) => setUserMoviesPage(page)}
                />
              </Box>
            ) : null}
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
