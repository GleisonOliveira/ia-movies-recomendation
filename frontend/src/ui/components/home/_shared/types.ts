import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';

export type PaginationMeta = {
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
  prev: number | null;
  next: number | null;
} | null;

export type UserMoviesState = {
  loading: boolean;
  error: string | null;
  data: Movie[];
  meta: PaginationMeta;
};

export type HomeHook = {
  userState: {
    loading: boolean;
    error: string | null;
    data: User[];
    meta: PaginationMeta;
    page: number;
    selectedUser: User | null;
  };
  movieState: {
    userMovies: UserMoviesState;
    userMoviesPage: number;
    query: string;
    options: Movie[];
    loading: boolean;
    selected: Movie | null;
  };
  drawerOpen: boolean;
  userActions: {
    setUsersPage: (page: number) => void;
    openUserDrawer: (user: User) => void;
  };
  movieActions: {
    closeDrawer: () => void;
    setUserMoviesPage: (page: number) => void;
    handleMovieQueryChange: (value: string) => void;
    setSelectedMovieOption: (movie: Movie | null) => void;
    addMovieToUser: (movie: Movie | null) => Promise<void>;
    removeMovieFromUser: (movie: Movie) => Promise<void>;
  };
};

export type UserListProps = never;

export type UserDrawerProps = never;

export type MovieCardProps = {
  movie: Movie;
  onRemove: (movie: Movie) => void;
};

export type MovieSearchProps = {
  movieState: {
    query: string;
    options: Movie[];
    loading: boolean;
    selected: Movie | null;
  };
  movieActions: {
    handleMovieQueryChange: (value: string) => void;
    setSelectedMovieOption: (movie: Movie | null) => void;
    addMovieToUser: (movie: Movie | null) => Promise<void>;
  };
};
