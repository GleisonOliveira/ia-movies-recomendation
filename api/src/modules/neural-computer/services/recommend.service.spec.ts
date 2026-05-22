import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@/generatedprisma/client';
import { RecommendService } from './recommend.service';
import { NeuralComputerServiceFactory } from '../neural-computer-service-factory';
import { MovieResponseDto } from '@/modules/movie/dto/movie.response.dto';
import { buildMovie } from '../../../../test/movie/movie-test-utils';

// RecommendService delega recomendação ao NeuralComputerInterface e converte Movie → MovieResponseDto.
// O NeuralComputerServiceFactory e o serviço neural subjacente são mockados — sem Prisma nem Neo4j aqui.

describe('RecommendService', () => {
  let service: RecommendService;

  const mockRecommend = jest.fn();
  const neuralComputerServiceFactory = {
    create: jest.fn(() => ({ recommend: mockRecommend })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendService,
        {
          provide: NeuralComputerServiceFactory,
          useValue: neuralComputerServiceFactory,
        },
      ],
    }).compile();

    service = module.get<RecommendService>(RecommendService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar filmes recomendados como MovieResponseDto', async () => {
    const movie = buildMovie({
      id: 10,
      title: 'Recommended',
      vote_average: new Prisma.Decimal(7.5),
    });
    mockRecommend.mockResolvedValue([movie]);

    const result = await service.recommend(1);

    expect(neuralComputerServiceFactory.create).toHaveBeenCalled();
    expect(mockRecommend).toHaveBeenCalledWith(1);
    expect(result).toMatchObject([
      {
        id: 10,
        title: 'Recommended',
        vote_average: 7.5,
      },
    ]);
  });

  it('deve retornar array vazio quando nenhum filme é recomendado', async () => {
    mockRecommend.mockResolvedValue([]);

    const result = await service.recommend(1);

    expect(result).toEqual([]);
  });

  it('deve converter vote_average de Decimal para number', async () => {
    const movie = buildMovie({
      id: 5,
      vote_average: new Prisma.Decimal(9.1),
    });
    mockRecommend.mockResolvedValue([movie]);

    const result = await service.recommend(1);

    expect(typeof result[0].vote_average).toBe('number');
    expect(result[0].vote_average).toBeCloseTo(9.1);
  });

  it('deve retornar instâncias de MovieResponseDto', async () => {
    const movie = buildMovie({ id: 7, vote_average: new Prisma.Decimal(6.0) });
    mockRecommend.mockResolvedValue([movie]);

    const result = await service.recommend(1);

    expect(result[0]).toBeInstanceOf(MovieResponseDto);
  });

  it('deve passar userId correto para recommend do serviço neural', async () => {
    mockRecommend.mockResolvedValue([]);

    await service.recommend(42);

    expect(mockRecommend).toHaveBeenCalledWith(42);
  });

  it('deve propagar erro lançado pelo serviço neural', async () => {
    mockRecommend.mockRejectedValue(new Error('Neural service error'));

    await expect(service.recommend(1)).rejects.toThrow('Neural service error');
  });

  it('deve mapear múltiplos filmes preservando a ordem', async () => {
    const movies = [
      buildMovie({
        id: 1,
        title: 'Primeiro',
        vote_average: new Prisma.Decimal(8.0),
      }),
      buildMovie({
        id: 2,
        title: 'Segundo',
        vote_average: new Prisma.Decimal(7.0),
      }),
      buildMovie({
        id: 3,
        title: 'Terceiro',
        vote_average: new Prisma.Decimal(6.0),
      }),
    ];
    mockRecommend.mockResolvedValue(movies);

    const result = await service.recommend(1);

    expect(result).toHaveLength(3);
    expect(result.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(result.map((m) => m.title)).toEqual([
      'Primeiro',
      'Segundo',
      'Terceiro',
    ]);
  });
});
