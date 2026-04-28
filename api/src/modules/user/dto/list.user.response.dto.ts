import { AbstractListResponseDto } from '../../responses/abstract-list-response.dto';
import { ListUserLatestMoviesItemDto } from './list-user-latest-movies-item.dto';

export class ListUserResponseDto extends AbstractListResponseDto<ListUserLatestMoviesItemDto> {}
