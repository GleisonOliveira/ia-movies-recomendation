import { ApiProperty } from '@nestjs/swagger';
import { AbstractListResponseDto } from '../../responses/abstract-list-response.dto';
import { MovieResponseDto } from './movie.response.dto';

export class ListMoviesResponseDto extends AbstractListResponseDto<MovieResponseDto> {
  @ApiProperty({ type: () => MovieResponseDto, isArray: true })
  data: MovieResponseDto[] = [];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      last_page: { type: 'number' },
      current_page: { type: 'number' },
      per_page: { type: 'number' },
      prev: { type: 'number', nullable: true },
      next: { type: 'number', nullable: true },
    },
  })
  meta = {
    total: 0,
    last_page: 0,
    current_page: 0,
    per_page: 0,
    prev: 0,
    next: 0,
  };
}
