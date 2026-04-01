import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TmdbMoviesRequestInterface } from '@/interfaces/recomendation-service/tmdb/tmdb-movies-request.interface';

@Injectable()
export class TmdbConnector {
  #tmdbToken: string;
  #tmdbBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.#tmdbToken = this.configService.get<string>('TMDB_TOKEN') ?? '';
    this.#tmdbBaseUrl = this.configService.get<string>('TMDB_BASE_URL') ?? '';
  }

  /**
   * Make an async request to TMDB
   *
   * @param method
   * @param url
   * @param params
   * @throws
   * @returns
   */
  async request<T>(
    method: Method,
    url: string,
    params: TmdbMoviesRequestInterface,
  ): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.request<T>({
        method,
        baseURL: this.#tmdbBaseUrl,
        url,
        headers: {
          Authorization: `Bearer ${this.#tmdbToken}`,
        },
        params,
      }),
    );

    return data;
  }
}
