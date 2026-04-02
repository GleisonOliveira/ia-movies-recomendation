import { Prisma } from '@/generatedprisma/client';

export class MovieCreateDto {
  constructor(
    public title: string,
    public external_id: number,
    public original_language: string,
    public overview: string,
    public popularity: number,
    public poster_path: string | null,
    public adult: boolean,
    public release_date: Date,
    public vote_average: number,
    public vote_count: number,
  ) {}

  toModel(): Prisma.MovieCreateInput {
    return {
      title: this.title,
      external_id: this.external_id,
      original_language: this.original_language,
      overview: this.overview,
      popularity: this.popularity,
      poster_path: this.poster_path,
      adult: this.adult,
      release_date:
        this.release_date instanceof Date
          ? this.release_date
          : new Date(this.release_date),
      vote_average: this.vote_average,
      vote_count: this.vote_count,
    };
  }
}
