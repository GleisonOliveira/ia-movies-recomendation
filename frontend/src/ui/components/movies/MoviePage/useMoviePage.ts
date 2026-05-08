import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadMovies } from '@/store/movies/moviesThunks';
import { setMovieQuery, setMoviesPage } from '@/store/movies/moviesSlice';

export function useMoviePage() {
  const dispatch = useAppDispatch();
  const { loading, error, data, meta, page, query } = useAppSelector((state) => state.movies);

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    void dispatch(loadMovies({ page, name: query || undefined }));
  }, [dispatch, page, query]);

  const canSubmit = useMemo(() => localQuery.trim().length > 0, [localQuery]);

  const onSubmitSearch = () => {
    dispatch(setMovieQuery(localQuery));
  };

  const onRetry = () => {
    void dispatch(loadMovies({ page, name: query || undefined }));
  };

  return {
    loading,
    error,
    data,
    meta,
    page,
    query,
    localQuery,
    setLocalQuery,
    canSubmit,
    onSubmitSearch,
    onRetry,
    onChangePage: (nextPage: number) => dispatch(setMoviesPage(nextPage)),
  };
}

