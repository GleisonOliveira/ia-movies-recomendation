import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { resetMoviesState } from '@/store/movies/moviesSlice';
import { MoviePage } from '@/ui/components/movies/MoviePage/MoviePage';

export function MoviesPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetMoviesState());
  }, [dispatch]);

  return <MoviePage />;
}

