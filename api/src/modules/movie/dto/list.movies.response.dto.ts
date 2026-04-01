import { Movie } from '@/generatedprisma/client';
import { AbstractListResponseDto } from '@/modules/responses/abstract-list-response.dto';

export class ListMoviesResponseDto extends AbstractListResponseDto<Movie> {}
