import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserCollectionService } from './user-collection.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { UserDataNormalizationService } from '../normalizers/user-data-normalization.service';
import { UserRepository } from '@/modules/user/repository/user-repository';
import type { User } from '@/generatedprisma/client';
import { buildUser } from '../../../../../test/user/user-test-utils';

describe('UserCollectionService', () => {
  let service: UserCollectionService;
  const prismaService = {
    user: {
      findMany: jest.fn(),
    },
  };
  const configService: { get: jest.Mock } = {
    get: jest.fn(),
  };

  const testUsers: User[] = [
    buildUser({ id: 1, age: 25 }),
    buildUser({ id: 2, age: 30 }),
    buildUser({ id: 3, age: 35 }),
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    configService.get.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCollectionService,
        UserDataNormalizationService,
        UserRepository,
        { provide: PrismaService, useValue: prismaService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<UserCollectionService>(UserCollectionService);
  });

  describe('collectAndFitUsers', () => {
    it('should collect users in a single chunk and compute correct aggregates', async () => {
      prismaService.user.findMany.mockResolvedValueOnce(testUsers);

      const result = await service.collectAndFitUsers();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: 200,
      });

      expect(result.users).toEqual(testUsers);

      const ageValues = testUsers.map((u) => u.age);
      const expectedAggregates = {
        ageMin: Math.min(...ageValues),
        ageMax: Math.max(...ageValues),
      };

      expect(result.aggregates).toEqual(expectedAggregates);
    });

    it('should load users across multiple chunks when exceeding chunkSize', async () => {
      const chunkSize = 2;
      configService.get.mockReturnValue(chunkSize);

      const firstChunk = Array.from({ length: 2 }, (_, i) =>
        buildUser({ id: i + 1, age: 18 + i }),
      );
      const secondChunk = Array.from({ length: 2 }, (_, i) =>
        buildUser({ id: 3 + i, age: 25 + i }),
      );
      const thirdChunk = [buildUser({ id: 5, age: 40 })];

      prismaService.user.findMany
        .mockResolvedValueOnce(firstChunk)
        .mockResolvedValueOnce(secondChunk)
        .mockResolvedValueOnce(thirdChunk);

      const result = await service.collectAndFitUsers();

      // loadUsersInChunks stops after a chunk smaller than chunkSize,
      // so only 3 calls are made (2 full + 1 partial)
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(3);
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(1, {
        orderBy: { id: 'asc' },
        skip: 0,
        take: chunkSize,
      });
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(2, {
        orderBy: { id: 'asc' },
        skip: chunkSize,
        take: chunkSize,
      });
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(3, {
        orderBy: { id: 'asc' },
        skip: chunkSize * 2,
        take: chunkSize,
      });

      expect(result.users).toHaveLength(5);
      expect(result.users).toEqual([
        ...firstChunk,
        ...secondChunk,
        ...thirdChunk,
      ]);

      const allAges = [...firstChunk, ...secondChunk, ...thirdChunk].map(
        (u) => u.age,
      );
      expect(result.aggregates.ageMin).toBe(Math.min(...allAges));
      expect(result.aggregates.ageMax).toBe(Math.max(...allAges));
    });

    it('should use default chunkSize when config returns undefined', async () => {
      configService.get.mockReturnValue(undefined);

      prismaService.user.findMany.mockResolvedValueOnce(testUsers);

      await service.collectAndFitUsers();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: 200,
      });
    });
  });
});
