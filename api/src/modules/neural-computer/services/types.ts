import { Movie } from '@/generatedprisma/client';
import { User } from '@/generatedprisma/client';

export type MovieFeatureAggregates = {
  popularityMin: number;
  popularityMax: number;
  voteAverageMin: number;
  voteAverageMax: number;
  languageToIndex: Record<string, number>;
};

export type MovieTensorFeatures = {
  movie_id: number;
  popularity: number;
  adult: number; // 0/1
  vote_average: number;
  original_language_index: number;
};

export type UserFeatureAggregates = {
  ageMin: number;
  ageMax: number;
};

export type UserTensorFeatures = {
  user_id: number;
  age: number;
};

export type MovieRawFeatures = {
  movie_id: number;
  original_language: string;
  popularity: number;
  adult: boolean;
  vote_average: number;
};

export type UserRawFeatures = {
  user_id: number;
  age: number;
};

export type MovieCollectResult = {
  movies: Movie[];
  aggregates: MovieFeatureAggregates;
};

export type UserCollectResult = {
  users: User[];
  aggregates: UserFeatureAggregates;
};
