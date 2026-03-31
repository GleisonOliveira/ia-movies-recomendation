export type TmdbMovieSortByFields =
  | 'original_title'
  | 'popularity'
  | 'revenue'
  | 'primary_release_date'
  | 'title'
  | 'vote_average'
  | 'vote_count';

export type TmdbSortType = 'asc' | 'desc';

export interface TmdbMoviesRequestInterface {
  page: number;
  sort_by?: `${TmdbMovieSortByFields}.${TmdbSortType}`;
}
