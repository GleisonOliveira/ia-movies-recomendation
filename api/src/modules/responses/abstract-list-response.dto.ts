import { CamelCaseMeta } from '@/interfaces/meta/camel-case-meta';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export abstract class AbstractListResponseDto<T> {
  @ApiProperty({ type: () => Object, isArray: true })
  @Expose()
  data: T[] = [];

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
  @Expose()
  @Transform((value: TransformFnParams) => {
    const meta = value.value as CamelCaseMeta;

    return {
      total: meta.total,
      last_page: meta.lastPage,
      current_page: meta.currentPage,
      per_page: meta.perPage,
      prev: meta.prev,
      next: meta.next,
    };
  })
  meta: {
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
    prev: number | null;
    next: number | null;
  } = {
    total: 0,
    last_page: 0,
    current_page: 0,
    per_page: 0,
    prev: 0,
    next: 0,
  };
}
