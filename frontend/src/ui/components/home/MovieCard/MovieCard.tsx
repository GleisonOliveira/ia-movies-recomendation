import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { MovieCardProps } from '../_shared/types';
import { MissingPosterIcon, RemoveIcon } from '../_shared/icons';
import { env } from '@/config/env';

export function MovieCard({ movie, onRemove }: MovieCardProps) {
  const releaseDate = new Date(movie.release_date);
  const formattedReleaseDate = new Intl.DateTimeFormat('pt-BR').format(releaseDate);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.25}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '2 / 3',
              borderRadius: 0,
              overflow: 'hidden',
              bgcolor: 'action.hover',
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

          <Typography variant="subtitle2" sx={{ lineHeight: 1.15, fontWeight: 800 }}>
            {movie.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Nota {movie.vote_average.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedReleaseDate}
          </Typography>

          <Button
            variant="contained"
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => onRemove(movie)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Remover
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
