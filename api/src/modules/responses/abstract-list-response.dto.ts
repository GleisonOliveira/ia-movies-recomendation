import { CamelCaseMeta } from '@/interfaces/meta/camel-case-meta';
import { Expose, Transform, TransformFnParams } from 'class-transformer';

export abstract class AbstractListResponseDto<T> {
  @Expose()
  data: T[];

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
  };
}
