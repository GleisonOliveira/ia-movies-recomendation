import { Injectable } from '@nestjs/common';
import { User } from '@/generatedprisma/client';
import {
  type UserFeatureAggregates,
  type UserTensorFeatures,
  type UserRawFeatures,
} from '../types';

@Injectable()
export class UserDataNormalizationService {
  #getUserFields(user: User): UserRawFeatures {
    return {
      user_id: user.id,
      age: user.age,
    };
  }

  createEmptyUserFeatureAggregates(): {
    ageMin: number | null;
    ageMax: number | null;
  } {
    return {
      ageMin: null,
      ageMax: null,
    };
  }

  updateUserFeatureAggregates(
    agg: ReturnType<
      UserDataNormalizationService['createEmptyUserFeatureAggregates']
    >,
    user: User,
  ): void {
    const { age } = this.#getUserFields(user);

    agg.ageMin = agg.ageMin === null ? age : Math.min(agg.ageMin, age);
    agg.ageMax = agg.ageMax === null ? age : Math.max(agg.ageMax, age);
  }

  finalizeUserFeatureAggregates(
    agg: ReturnType<
      UserDataNormalizationService['createEmptyUserFeatureAggregates']
    >,
  ): UserFeatureAggregates {
    return {
      ageMin: agg.ageMin ?? 0,
      ageMax: agg.ageMax ?? 0,
    };
  }

  normalizeUserForTensor(
    user: User,
    aggregates: UserFeatureAggregates,
  ): UserTensorFeatures {
    const raw = this.#getUserFields(user);

    // Normalização min-max para colocar o valor entre 0 e 1:
    // age = (raw.age - ageMin) / (ageMax - ageMin)
    // Exemplo: ageMin=18, ageMax=60, raw.age=30 => (30-18)/(60-18)=0.286
    const ageRange = aggregates.ageMax - aggregates.ageMin || 1;

    const age = (raw.age - aggregates.ageMin) / ageRange;

    return {
      user_id: raw.user_id,
      age,
    };
  }
}
