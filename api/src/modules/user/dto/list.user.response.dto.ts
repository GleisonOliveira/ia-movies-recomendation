import { User } from '@/generatedprisma/client';
import { AbstractListResponseDto } from '@/modules/responses/abstract-list-response.dto';

export class ListUserResponseDto extends AbstractListResponseDto<User> {}
