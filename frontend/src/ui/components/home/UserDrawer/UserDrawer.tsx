import { Alert, Box, Button, Drawer, Pagination, Stack, Typography } from '@mui/material';
import { useMovieHome } from './useMovieHome';
import { MovieCard } from '../MovieCard/MovieCard';
import { MovieCardAdd } from '../MovieCardAdd/MovieCardAdd';
import { MovieSearch } from '../MovieSearch/MovieSearch';
import { Loading } from '../_shared/Loading/Loading';

export function UserDrawer() {
  const {
    movieState,
    drawerOpen,
    movieActions,
  } = useMovieHome();
  const { closeDrawer, setUserMoviesPage, removeMovieFromUser, handleMovieQueryChange, setSelectedMovieOption, addMovieToUser, addRecommendedMovie } = movieActions;
  const { userMovies, userMoviesPage, query, options, loading, selected, recommendations } = movieState;

  const movieGridSx = {
    display: 'grid',
    gap: 1.25,
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
      xl: 'repeat(6, minmax(0, 1fr))',
    },
  };

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
      <Box sx={{ width: { xs: '92vw', sm: '70vw', md: '60vw' }, p: 3 }}>
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

          {recommendations.loading || recommendations.data.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Recomendações
              </Typography>
              {recommendations.loading ? (
                <Loading minHeight="12vh" testId="recommendations-loading" />
              ) : (
                <Box sx={movieGridSx}>
                  {recommendations.data.map((movie) => (
                    <MovieCardAdd key={movie.id} movie={movie} onAdd={addRecommendedMovie} />
                  ))}
                </Box>
              )}
            </Box>
          ) : null}

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Filmes associados
            </Typography>
            {userMovies.loading ? <Loading minHeight="18vh" testId="user-movies-loading" /> : null}
            {userMovies.error ? <Alert severity="error">{userMovies.error}</Alert> : null}
            <Box sx={movieGridSx}>
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
