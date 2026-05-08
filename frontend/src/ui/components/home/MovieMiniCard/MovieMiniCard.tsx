import { Box, Typography } from '@mui/material';
import type { Movie } from '@/services/movie/MovieService';
import { MissingPosterIcon } from '../_shared/icons';
import { env } from '@/config/env';

type Props = {
  movie: Movie;
};

export function MovieMiniCard({ movie }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        p: 1,
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        width: { xs: '100%', lg: '100%' },
        maxWidth: 220,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          aspectRatio: '56 / 72',
          borderRadius: 0,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          flexShrink: 0,
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

      <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }} title={movie.title}>
        {movie.title}
      </Typography>
    </Box>
  );
}
