import { Movie } from '@/generatedprisma/client';
import { AbstractListResponseDto } from '../../responses/abstract-list-response.dto';

export class ListMoviesResponseDto extends AbstractListResponseDto<
  Movie & { vote_average: number }
> {}
