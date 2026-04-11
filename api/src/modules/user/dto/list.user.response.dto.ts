import { User } from '@/generatedprisma/client';
import { AbstractListResponseDto } from '../../responses/abstract-list-response.dto';

export class ListUserResponseDto extends AbstractListResponseDto<User> {}
