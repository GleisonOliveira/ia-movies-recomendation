import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { User } from '@/services/user/UserService';
import type { Movie } from '@/services/movie/MovieService';
import { MovieMiniCard } from './MovieMiniCard';

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
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(139,211,255,0.08), rgba(255,255,255,0.02))',
        transition: 'transform 160ms ease, border-color 160ms ease, background 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, rgba(139,211,255,0.15), rgba(255,255,255,0.04))',
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
                  borderRadius: 2,
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
