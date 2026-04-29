import { Box, Typography } from '@mui/material';
import type { Movie } from '@/services/movie/MovieService';
import { MissingPosterIcon } from './icons';
import { env } from '@/config/env';

type Props = {
  movie: Movie;
};

export function MovieMiniCard({ movie }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        width: { xs: 220, lg: '100%' },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 72,
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {movie.poster_path ? (
          <Box
            component="img"
            src={`${env.TMDB_IMAGE_PATH}${movie.poster_path}`}
            alt={movie.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              color: 'text.secondary',
            }}
          >
            <MissingPosterIcon />
          </Box>
        )}
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 700 }} title={movie.title}>
        {movie.title}
      </Typography>
    </Box>
  );
}
