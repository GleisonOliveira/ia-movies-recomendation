import { Inject, Injectable, Logger } from '@nestjs/common';
import { Driver, Integer, Session } from 'neo4j-driver';
import { NEO4J_DRIVER } from '@/modules/neo4j/neo4j.module';

@Injectable()
export class Neo4jService {
  private readonly logger = new Logger(Neo4jService.name);
  private readonly driver: Driver;

  constructor(@Inject(NEO4J_DRIVER) driver: Driver) {
    this.driver = driver;
  }

  // Cria constraints de unicidade e vector indexes no Neo4j.
  // Deve ser chamado na inicialização da aplicação (ou num comando de setup).
  // Os vector indexes (Neo4j >= 5.12) habilitam busca ANN via db.index.vector.queryNodes,
  // que é ordens de magnitude mais rápida que o fallback manual de cosine similarity.
  async ensureIndexes(): Promise<void> {
    const session: Session = this.driver.session();

    try {
      await session.run(`
        CREATE CONSTRAINT user_id_unique IF NOT EXISTS
        FOR (u:User) REQUIRE u.userId IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT movie_id_unique IF NOT EXISTS
        FOR (m:Movie) REQUIRE m.movieId IS UNIQUE
      `);

      try {
        await session.run(`
          CREATE VECTOR INDEX user_embedding_index IF NOT EXISTS
          FOR (u:User) ON (u.embedding)
        `);
        this.logger.log(
          'Vector index for User.embedding created or already exists',
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('already exists')) {
          this.logger.warn(`Failed to create user vector index: ${msg}`);
        }
      }

      try {
        await session.run(`
          CREATE VECTOR INDEX movie_embedding_index IF NOT EXISTS
          FOR (m:Movie) ON (m.embedding)
        `);
        this.logger.log(
          'Vector index for Movie.embedding created or already exists',
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('already exists')) {
          this.logger.warn(`Failed to create movie vector index: ${msg}`);
        }
      }
    } finally {
      await session.close();
    }
  }

  // Persiste o embedding de um filme no Neo4j via MERGE — idempotente.
  // Chamado pelo comando movie-neural-embed após o treino do modelo two-tower,
  // para pré-computar e armazenar os vetores de todos os filmes.
  async upsertMovieEmbedding(
    movieId: number,
    embedding: number[],
  ): Promise<void> {
    const session: Session = this.driver.session();
    try {
      await session.run(
        `
        MERGE (m:Movie {movieId: $movieId})
        SET m.embedding = $embedding
      `,
        { movieId, embedding },
      );
    } finally {
      await session.close();
    }
  }

  // Busca os N filmes mais similares ao embedding do usuário usando o vector index do Neo4j.
  // excludeMovieIds filtra filmes que o usuário já assistiu.
  // Fallback automático para busca manual de cosine similarity caso o vector index
  // não esteja disponível (Neo4j < 5.12 ou index ainda não criado).
  async findSimilarMovies(
    userEmbedding: number[],
    limit: number,
    excludeMovieIds: number[] = [],
  ): Promise<number[]> {
    const session: Session = this.driver.session();
    try {
      let query = `
        CALL db.index.vector.queryNodes('movie_embedding_index', $limit, $embedding)
        YIELD node, score
      `;

      if (excludeMovieIds.length > 0) {
        query += ` WHERE NOT node.movieId IN $excludeIds`;
      }

      query += `
        RETURN node.movieId AS movieId
      `;

      const result = await session.run(query, {
        limit,
        embedding: userEmbedding,
        excludeIds: excludeMovieIds,
      });

      return result.records.map((r) => {
        const id = r.get('movieId') as Integer | number;
        return Integer.isInteger(id) ? id.toNumber() : id;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `Vector index query failed, falling back to manual similarity: ${msg}`,
      );
      return this.findSimilarMoviesManual(
        userEmbedding,
        limit,
        excludeMovieIds,
      );
    } finally {
      await session.close();
    }
  }

  // Fallback para quando o vector index não está disponível.
  // Carrega todos os filmes com embedding e calcula cosine similarity em memória — O(n).
  // Funcional para catálogos pequenos; para produção, prefira sempre o vector index.
  private async findSimilarMoviesManual(
    userEmbedding: number[],
    limit: number,
    excludeMovieIds: number[],
  ): Promise<number[]> {
    const session: Session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (m:Movie) RETURN m.movieId AS movieId, m.embedding AS embedding',
      );
      const scored: { movieId: number; score: number }[] = [];

      for (const record of result.records) {
        const rawId = record.get('movieId') as Integer | number;
        const movieId = Integer.isInteger(rawId) ? rawId.toNumber() : rawId;
        if (excludeMovieIds.includes(movieId)) continue;

        const embedding = record.get('embedding') as number[];
        if (!embedding) continue;

        scored.push({
          movieId,
          score: this.cosineSimilarity(userEmbedding, embedding),
        });
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((s) => s.movieId);
    } finally {
      await session.close();
    }
  }

  // Calcula o cosine similarity entre dois vetores de mesma dimensão.
  // Retorna valor em [-1, 1]: 1 = idênticos, 0 = ortogonais, -1 = opostos.
  // O epsilon (1e-8) evita divisão por zero quando um dos vetores é nulo.
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
  }
}
