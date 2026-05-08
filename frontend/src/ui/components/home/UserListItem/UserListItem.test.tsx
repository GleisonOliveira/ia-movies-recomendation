import { fireEvent, render, screen } from '@testing-library/react';
import type { User } from '@/services/user/user-service';
import type { Movie } from '@/services/movie/MovieService';
import { UserListItem } from './UserListItem';

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

const userBase: Omit<User, 'latest_movies'> = {
  id: 10,
  name: 'Ana',
  age: 28,
};

describe('UserListItem', () => {
  it('renders user info and "Sem filmes" when latest_movies is empty', () => {
    const user: User = { ...userBase, latest_movies: [] };
    render(<UserListItem user={user} onClick={jest.fn()} />);

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('28 anos')).toBeInTheDocument();
    expect(screen.getByText('Últimos filmes')).toBeInTheDocument();
    expect(screen.getByText('Sem filmes')).toBeInTheDocument();
  });

  it('renders latest movies titles when latest_movies has items', () => {
    const user: User = { ...userBase, latest_movies: [movie] };
    render(<UserListItem user={user} onClick={jest.fn()} />);
    expect(screen.getByText('Matrix')).toBeInTheDocument();
  });

  it('calls onClick with user when the paper is clicked', () => {
    const onClick = jest.fn();
    const user: User = { ...userBase, latest_movies: [] };
    render(<UserListItem user={user} onClick={onClick} />);

    fireEvent.click(screen.getByText('Ana'));
    expect(onClick).toHaveBeenCalledWith(user);
  });
});

