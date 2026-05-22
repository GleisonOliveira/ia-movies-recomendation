import { ApiProperty } from '@nestjs/swagger';
import { AbstractListResponseDto } from '../../responses/abstract-list-response.dto';
import { ListUserLatestMoviesItemDto } from './list-user-latest-movies-item.dto';

export class ListUserResponseDto extends AbstractListResponseDto<ListUserLatestMoviesItemDto> {
  @ApiProperty({ type: () => ListUserLatestMoviesItemDto, isArray: true })
  data: ListUserLatestMoviesItemDto[] = [];

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
