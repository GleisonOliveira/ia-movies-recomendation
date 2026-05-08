import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { User } from '@/services/user/user-service';
import type { Movie } from '@/services/movie/MovieService';
import { MovieMiniCard } from '../MovieMiniCard/MovieMiniCard';

type Props = {
  user: User;
  onClick: (user: User) => void;
};

export function UserListItem({ user, onClick }: Props) {
  return (
    <Paper
      elevation={0}
      onClick={() => onClick(user)}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'var(--app-surface)',
        transition: 'border-color 160ms ease, background 160ms ease',
        '&:hover': {
          borderColor: 'var(--app-border-2)',
          backgroundColor: 'var(--app-surface-2)',
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usuário cadastrado
          </Typography>
        </Box>
        <Chip label={`${user.age} anos`} color="primary" variant="outlined" />
      </Stack>
        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Últimos filmes
          </Typography>
          <Box
            sx={{
              pl: 1,
              display: { xs: 'flex', lg: 'grid' },
              gridTemplateColumns: { lg: 'repeat(5, minmax(0, 1fr))' },
              gap: { xs: 1, lg: 1 },
              flexWrap: { xs: 'wrap', lg: 'nowrap' },
              alignItems: 'stretch',
            }}
          >
            {(user.latest_movies ?? []).map((movie: Movie) => (
              <MovieMiniCard key={movie.id} movie={movie} />
            ))}
            {(!user.latest_movies || user.latest_movies.length === 0) && (
              <Box
                sx={{
                  color: 'text.secondary',
                  display: 'grid',
                  placeItems: 'center',
                  width: '75%',
                  height: '75%',
                  mx: 'auto',
                  my: 'auto',
                  borderRadius: 0,
                  border: '1px dashed',
                  borderColor: 'divider',
                  p: 1,
                }}
              >
                <Typography variant="body2">Sem filmes</Typography>
              </Box>
            )}
          </Box>
        </Stack>
    </Paper>
  );
}
