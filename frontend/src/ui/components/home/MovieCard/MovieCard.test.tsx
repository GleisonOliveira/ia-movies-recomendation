import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { Movie } from '@/services/movie/MovieService';
import { env } from '@/config/env';
import { MovieCard } from './MovieCard';

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

describe('MovieCard', () => {
  it('renders missing poster when poster_path is null', () => {
    render(<MovieCard movie={{ ...baseMovie, poster_path: null }} onRemove={jest.fn()} />);

    expect(screen.getByAltText('Sem poster')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: baseMovie.title })).not.toBeInTheDocument();
  });

  it('renders poster image when poster_path exists', () => {
    render(<MovieCard movie={{ ...baseMovie, poster_path: '/p.png' }} onRemove={jest.fn()} />);

    const img = screen.getByRole('img', { name: baseMovie.title });
    expect(img).toHaveAttribute('src', `${env.TMDB_IMAGE_PATH}/p.png`);
  });

  it('removes the element from screen when clicking Remover', () => {
    function Wrapper() {
      const [movies, setMovies] = useState<Movie[]>([baseMovie]);
      return (
        <>
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              onRemove={(movie) => setMovies((prev) => prev.filter((x) => x.id !== movie.id))}
            />
          ))}
        </>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText(baseMovie.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

    expect(screen.queryByText(baseMovie.title)).not.toBeInTheDocument();
  });
});
