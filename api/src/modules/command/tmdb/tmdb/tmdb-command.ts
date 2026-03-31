import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { TmdbConnector } from '@/connectors/tmdb/tmdb-connector';
import { TmdbMoviesResponseInterface } from '@/interfaces/recomendation-service/tmdb/tmdb-movies-response.interface';
import { TMDB_CONSTANTS } from '@/constants/tmdb/tmdb.constants';

@Injectable()
@Command({
  name: 'tmdb-trainning',
  description: 'Populate tmdb vectors',
})
export class TmdbCommand extends CommandRunner {
  private readonly logger = new Logger(TmdbCommand.name);

  constructor(private readonly tmdbConnector: TmdbConnector) {
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
    results.forEach((movie) => {
      this.logger.log(movie.title);
    });
  }

  async #getMovies(page: number): Promise<TmdbMoviesResponseInterface> {
    const {
      movies: { uri },
    } = TMDB_CONSTANTS;

    return this.tmdbConnector.request<TmdbMoviesResponseInterface>('GET', uri, {
      page,
      sort_by: 'primary_release_date.asc',
    });
  }
}
