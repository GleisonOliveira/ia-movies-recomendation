import type { MovieService } from '@/services/movie/MovieService';
import type { UserService } from '@/services/user/user-service';

export type UserServiceGetAllReturn = ReturnType<UserService['getAll']>;
export type UserServiceGetAllArg0 = Parameters<UserService['getAll']>[0];

export type UserServiceCreateReturn = ReturnType<UserService['create']>;
export type UserServiceCreateArg0 = Parameters<UserService['create']>[0];

export type UserServiceGetMoviesByUserIdReturn = ReturnType<UserService['getMoviesByUserId']>;
export type UserServiceGetMoviesByUserIdArg0 = Parameters<
  UserService['getMoviesByUserId']
>[0];

export type UserServiceAddMovieToUserReturn = ReturnType<UserService['addMovieToUser']>;
export type UserServiceAddMovieToUserArg0 = Parameters<UserService['addMovieToUser']>[0];

export type UserServiceRemoveMovieFromUserReturn = ReturnType<
  UserService['removeMovieFromUser']
>;
export type UserServiceRemoveMovieFromUserArg0 = Parameters<
  UserService['removeMovieFromUser']
>[0];

export type MovieServiceGetAllReturn = ReturnType<MovieService['getAll']>;
export type MovieServiceGetAllArg0 = Parameters<MovieService['getAll']>[0];

