import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { UserDataNormalizationService } from '../normalizers/user-data-normalization.service';
import { User } from '@/generatedprisma/client';
import { type UserCollectResult } from '../types';

const DEFAULT_CHUNK_SIZE = 200;

@Injectable()
export class UserCollectionService {
  private readonly logger = new Logger(UserCollectionService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDataNormalizationService: UserDataNormalizationService,
    private readonly configService: ConfigService,
  ) {}

  async collectAndFitUsers(): Promise<UserCollectResult> {
    const chunkSize =
      this.configService.get<number>('USER_COLLECTION_CHUNK_SIZE') ??
      DEFAULT_CHUNK_SIZE;
    const agg =
      this.userDataNormalizationService.createEmptyUserFeatureAggregates();
    const users: User[] = [];

    return this.userRepository
      .loadUsersInChunks(async (chunk) => {
        for (const user of chunk) {
          users.push(user);
          this.logger.log(`Processing aggregates from user ${user.id}`);
          this.userDataNormalizationService.updateUserFeatureAggregates(
            agg,
            user,
          );
        }

        await Promise.resolve();
      }, chunkSize)
      .then(() => ({
        users,
        aggregates:
          this.userDataNormalizationService.finalizeUserFeatureAggregates(agg),
      }));
  }
}
