import { UserDataNormalizationService } from './user-data-normalization.service';
import { User } from '@/generatedprisma/client';

describe('UserDataNormalizationService.createEmptyUserFeatureAggregates', () => {
  it('should return null ageMin and ageMax', () => {
    const service = new UserDataNormalizationService();

    const agg = service.createEmptyUserFeatureAggregates();

    expect(agg).toEqual({
      ageMin: null,
      ageMax: null,
    });
  });
});

describe('UserDataNormalizationService.updateUserFeatureAggregates', () => {
  it('should initialize aggregates when they are null and a user is provided', () => {
    const service = new UserDataNormalizationService();
    const agg = service.createEmptyUserFeatureAggregates();

    const user = {
      id: 1,
      name: 'John',
      age: 25,
    } as User;

    service.updateUserFeatureAggregates(agg, user);

    expect(agg).toEqual({
      ageMin: 25,
      ageMax: 25,
    });
  });

  it('should update min/max when aggregates already have values', () => {
    const service = new UserDataNormalizationService();
    const agg = service.createEmptyUserFeatureAggregates();

    const userA = {
      id: 1,
      name: 'John',
      age: 25,
    } as User;

    service.updateUserFeatureAggregates(agg, userA);

    const userB = {
      id: 2,
      name: 'Jane',
      age: 40,
    } as User;

    service.updateUserFeatureAggregates(agg, userB);

    expect(agg).toEqual({
      ageMin: 25,
      ageMax: 40,
    });
  });

  it('should update ageMin when a younger user is provided', () => {
    const service = new UserDataNormalizationService();
    const agg = service.createEmptyUserFeatureAggregates();

    const userA = {
      id: 1,
      name: 'John',
      age: 30,
    } as User;

    service.updateUserFeatureAggregates(agg, userA);

    const userB = {
      id: 2,
      name: 'Jane',
      age: 18,
    } as User;

    service.updateUserFeatureAggregates(agg, userB);

    expect(agg).toEqual({
      ageMin: 18,
      ageMax: 30,
    });
  });

  it('should update ageMax when an older user is provided', () => {
    const service = new UserDataNormalizationService();
    const agg = service.createEmptyUserFeatureAggregates();

    const userA = {
      id: 1,
      name: 'John',
      age: 30,
    } as User;

    service.updateUserFeatureAggregates(agg, userA);

    const userB = {
      id: 2,
      name: 'Jane',
      age: 65,
    } as User;

    service.updateUserFeatureAggregates(agg, userB);

    expect(agg).toEqual({
      ageMin: 30,
      ageMax: 65,
    });
  });
});

describe('UserDataNormalizationService.finalizeUserFeatureAggregates', () => {
  it('should return the same aggregate values', () => {
    const service = new UserDataNormalizationService();

    const agg = {
      ageMin: 18,
      ageMax: 65,
    };

    const finalized = service.finalizeUserFeatureAggregates(agg);

    expect(finalized).toEqual(agg);
  });

  it('should replace null values with 0', () => {
    const service = new UserDataNormalizationService();

    const agg = {
      ageMin: null,
      ageMax: null,
    };

    const finalized = service.finalizeUserFeatureAggregates(agg);

    expect(finalized).toEqual({
      ageMin: 0,
      ageMax: 0,
    });
  });
});

describe('UserDataNormalizationService.normalizeUserForTensor', () => {
  it('normalizes age to [0,1] using aggregates', () => {
    const service = new UserDataNormalizationService();

    const user = {
      id: 1,
      name: 'John',
      age: 30,
    } as User;

    const aggregates = {
      ageMin: 18,
      ageMax: 60,
    };

    const out = service.normalizeUserForTensor(user, aggregates);

    expect(out.user_id).toBe(1);
    expect(out.age).toBe((30 - 18) / (60 - 18));
  });

  it('handles zero ranges by treating denominator as 1 (no division by zero)', () => {
    const service = new UserDataNormalizationService();

    const user = {
      id: 5,
      name: 'John',
      age: 30,
    } as User;

    const aggregates = {
      ageMin: 30,
      ageMax: 30,
    };

    const out = service.normalizeUserForTensor(user, aggregates);

    expect(out.user_id).toBe(5);
    expect(out.age).toBe(0);
  });

  it('returns 0 when age equals ageMin', () => {
    const service = new UserDataNormalizationService();

    const user = {
      id: 1,
      name: 'John',
      age: 18,
    } as User;

    const aggregates = {
      ageMin: 18,
      ageMax: 60,
    };

    const out = service.normalizeUserForTensor(user, aggregates);

    expect(out.age).toBe(0);
  });

  it('returns 1 when age equals ageMax', () => {
    const service = new UserDataNormalizationService();

    const user = {
      id: 1,
      name: 'John',
      age: 60,
    } as User;

    const aggregates = {
      ageMin: 18,
      ageMax: 60,
    };

    const out = service.normalizeUserForTensor(user, aggregates);

    expect(out.age).toBe(1);
  });
});
