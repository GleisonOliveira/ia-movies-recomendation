import { render, screen } from '@testing-library/react';
import type { Movie } from '@/services/movie/MovieService';
import { env } from '@/config/env';
import { MovieMiniCard } from './MovieMiniCard';

const baseMovie: Movie = {
  id: 1,
  title: 'Matrix',
  external_id: 1,
  original_language: 'en',
  overview: '...',
  popularity: 1,
  poster_path: null,
  adult: false,
  release_date: '2020-01-01',
  vote_average: 8.1,
  vote_count: 10,
};

describe('MovieMiniCard', () => {
  it('renders missing poster when poster_path is null', () => {
    render(<MovieMiniCard movie={{ ...baseMovie, poster_path: null }} />);
    const img = screen.getByAltText('Sem poster');
    expect(img).toBeInTheDocument();
    expect(img).toHaveStyle({ width: '75%', height: '75%', objectFit: 'contain' });
  });

  it('renders poster image when poster_path exists', () => {
    render(<MovieMiniCard movie={{ ...baseMovie, poster_path: '/p.png' }} />);
    const img = screen.getByRole('img', { name: baseMovie.title });
    expect(img).toHaveAttribute('src', `${env.TMDB_IMAGE_PATH}/p.png`);
  });

  it('renders title', () => {
    render(<MovieMiniCard movie={{ ...baseMovie, poster_path: '/p.png' }} />);
    expect(screen.getByText(baseMovie.title)).toBeInTheDocument();
  });
});
