import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Movie } from '@/services/movie/MovieService';
import {
  addMovieToUser as addMovieToUserThunk,
  closeDrawer as closeDrawerAction,
  loadUserMovies,
  removeMovieFromUser as removeMovieFromUserThunk,
  searchMovies,
  setMovieQuery,
  setSelectedMovie,
  setUserMoviesPage,
} from '@/store/users/usersSlice';

export function useMovieHome() {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector((state) => state.home.selectedUser);
  const movieState = useAppSelector((state) => state.home.movieState);
  const drawerOpen = useAppSelector((state) => state.home.selectedUser !== null);

  useEffect(() => {
    if (!selectedUser) return;
    void dispatch(loadUserMovies({ userId: selectedUser.id, page: movieState.userMoviesPage }));
  }, [dispatch, movieState.userMoviesPage, selectedUser]);

  useEffect(() => {
    if (!movieState.query.trim()) return;
    const timeout = window.setTimeout(() => {
      void dispatch(searchMovies(movieState.query.trim()));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [dispatch, movieState.query]);

  return {
    movieState,
    drawerOpen,
    movieActions: {
      closeDrawer: () => dispatch(closeDrawerAction()),
      setUserMoviesPage: (page: number) => dispatch(setUserMoviesPage(page)),
      handleMovieQueryChange: (value: string) => dispatch(setMovieQuery(value)),
      setSelectedMovieOption: (movie: Movie | null) => dispatch(setSelectedMovie(movie)),
      addMovieToUser: async (movie: Movie | null) => {
        if (!selectedUser || !movie) return;
        await dispatch(addMovieToUserThunk({ userId: selectedUser.id, movie }));
        dispatch(setMovieQuery(''));
        dispatch(setSelectedMovie(null));
        void dispatch(loadUserMovies({ userId: selectedUser.id, page: movieState.userMoviesPage }));
      },
      removeMovieFromUser: async (movie: Movie) => {
        if (!selectedUser) return;
        await dispatch(removeMovieFromUserThunk({ userId: selectedUser.id, movieId: movie.id }));
        void dispatch(loadUserMovies({ userId: selectedUser.id, page: movieState.userMoviesPage }));
      },
    },
  };
}
