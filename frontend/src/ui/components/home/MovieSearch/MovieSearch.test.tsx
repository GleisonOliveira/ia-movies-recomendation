import { fireEvent, render, screen } from '@testing-library/react';
import type { Movie } from '@/services/movie/MovieService';
import { MovieSearch } from './MovieSearch';

const movie: Movie = {
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

describe('MovieSearch', () => {
  it('disables Adicionar when selected is null', () => {
    const addMovieToUser = jest.fn();
    render(
      <MovieSearch
        movieState={{ query: '', options: [], loading: false, selected: null }}
        movieActions={{
          handleMovieQueryChange: jest.fn(),
          setSelectedMovieOption: jest.fn(),
          addMovieToUser,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  });

  it('enables Adicionar and calls addMovieToUser(selected) when clicked', () => {
    const addMovieToUser = jest.fn().mockResolvedValue(undefined);
    render(
      <MovieSearch
        movieState={{ query: '', options: [movie], loading: false, selected: movie }}
        movieActions={{
          handleMovieQueryChange: jest.fn(),
          setSelectedMovieOption: jest.fn(),
          addMovieToUser,
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Adicionar' });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(addMovieToUser).toHaveBeenCalledWith(movie);
  });
});
