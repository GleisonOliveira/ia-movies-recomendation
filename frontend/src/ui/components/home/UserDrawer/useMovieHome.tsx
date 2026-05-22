import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Movie } from '@/services/movie/MovieService';
import {
  addMovieToUser as addMovieToUserThunk,
  closeDrawer as closeDrawerAction,
  loadRecommendations,
  loadUserMovies,
  removeMovieFromUser as removeMovieFromUserThunk,
  searchMovies,
  setMovieQuery,
  setSelectedMovie,
  setUserMoviesPage,
} from '@/store/users/usersSlice';

const MOVIES_PER_PAGE = 6;

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
    if (!selectedUser) return;
    void dispatch(loadRecommendations(selectedUser.id));
  }, [dispatch, selectedUser]);

  useEffect(() => {
    if (!movieState.query.trim()) return;
    const timeout = window.setTimeout(() => {
      void dispatch(searchMovies(movieState.query.trim()));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [dispatch, movieState.query]);

  const doAddMovie = async (movie: Movie | null) => {
    if (!selectedUser || !movie) return;
    const result = await dispatch(addMovieToUserThunk({ userId: selectedUser.id, movie, perPage: MOVIES_PER_PAGE }));
    if (addMovieToUserThunk.rejected.match(result)) return;
    dispatch(setMovieQuery(''));
    dispatch(setSelectedMovie(null));
  };

  return {
    movieState,
    drawerOpen,
    movieActions: {
      closeDrawer: () => dispatch(closeDrawerAction()),
      setUserMoviesPage: (page: number) => dispatch(setUserMoviesPage(page)),
      handleMovieQueryChange: (value: string) => dispatch(setMovieQuery(value)),
      setSelectedMovieOption: (movie: Movie | null) => dispatch(setSelectedMovie(movie)),
      addMovieToUser: doAddMovie,
      addRecommendedMovie: (movie: Movie) => doAddMovie(movie),
      removeMovieFromUser: async (movie: Movie) => {
        if (!selectedUser) return;
        await dispatch(removeMovieFromUserThunk({ userId: selectedUser.id, movieId: movie.id }));
        void dispatch(loadUserMovies({ userId: selectedUser.id, page: movieState.userMoviesPage }));
      },
    },
  };
}
