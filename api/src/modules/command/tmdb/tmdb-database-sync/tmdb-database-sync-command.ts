import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { TmdbMoviesResponseInterface } from '@/interfaces/recomendation-service/tmdb/tmdb-movies-response.interface';
import { TMDB_CONSTANTS } from '@/constants/tmdb/tmdb.constants';
import { MovieService } from '@/modules/movie/service/movie-service/movie-service';
import { MovieCreateDto } from '@/modules/movie/dto/movie.create.dto';
import { TmdbMoviesRequestInterface } from '@/interfaces/recomendation-service/tmdb/tmdb-movies-request.interface';

@Injectable()
@Command({
  name: 'tmdb-database-sync',
  description: 'Populate tmdb vectors',
})
export class TmdbDatabaseSyncCommand extends CommandRunner {
  private readonly logger = new Logger(TmdbDatabaseSyncCommand.name);

  constructor(
    private readonly tmdbConnector: TmdbConnector,
    private readonly movieService: MovieService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Started process');

    await this.#process();

    this.logger.log('Finished process');
  }

  async #process(): Promise<void> {
    try {
      const {
        movies: { maxPages },
      } = TMDB_CONSTANTS;

      const promises: Promise<TmdbMoviesResponseInterface>[] = [];

      for (let page = 1; page <= maxPages; page++) {
        promises.push(this.#getMovies(page));
      }

      const results = await Promise.allSettled(promises);

      await this.#processResults(results);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async #processResults(
    results: PromiseSettledResult<TmdbMoviesResponseInterface>[],
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    results.forEach((result) => {
      if (result.status === 'rejected') return;

      promises.push(this.#processMovies(result.value));
    });

    await Promise.allSettled(promises);
  }

  async #processMovies({
    results,
  }: TmdbMoviesResponseInterface): Promise<void> {
    for (const movie of results) {
      this.logger.log(`Processing movie: ${movie.title}`);

      const {
        title,
        id,
        original_language,
        overview,
        popularity,
        poster_path,
        adult,
        release_date,
        vote_average,
        vote_count,
      } = movie;
      const existingMovie = await this.movieService.getById(id);

      if (!existingMovie) {
        await this.movieService.createMovie(
          new MovieCreateDto(
            title,
            id,
            original_language,
            overview,
            popularity,
            poster_path,
            adult,
            new Date(release_date),
            vote_average,
            vote_count,
          ),
        );
      }
    }
  }

  async #getMovies(page: number): Promise<TmdbMoviesResponseInterface> {
    const {
      movies: { uri },
    } = TMDB_CONSTANTS;

    const latestReleaseDate = await this.movieService.getLatestReleaseDate();

    const queryParams: TmdbMoviesRequestInterface = {
      page,
      sort_by: 'primary_release_date.asc',
    };

    if (latestReleaseDate) {
      queryParams['release_date.gte'] = latestReleaseDate.toDateString();
    }

    return this.tmdbConnector.request<TmdbMoviesResponseInterface>(
      'GET',
      uri,
      queryParams,
    );
  }
}
