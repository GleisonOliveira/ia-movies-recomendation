import { Injectable } from '@nestjs/common';
import { User } from '@/generatedprisma/client';
import {
  type UserFeatureAggregates,
  type UserTensorFeatures,
  type UserRawFeatures,
} from '../types';

@Injectable()
export class UserDataNormalizationService {
  // Extrai apenas os campos relevantes do usuário (id e age) para uso interno na normalização.
  #getUserFields(user: User): UserRawFeatures {
    return {
      user_id: user.id,
      age: user.age,
    };
  }

  // Cria um objeto inicial de agregados de features do usuário com valores nulos, usado como ponto de partida antes de processar qualquer usuário.
  createEmptyUserFeatureAggregates(): {
    ageMin: number | null;
    ageMax: number | null;
  } {
    return {
      ageMin: null,
      ageMax: null,
    };
  }

  // Atualiza os valores mínimo e máximo de idade nos agregados com base no usuário fornecido. Deve ser chamado para cada usuário durante o carregamento em chunks.
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

  // Converte os agregados parciais (com possíveis nulos) em aggregates finais prontos para normalização, substituindo nulos por 0.
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

  // Normaliza os dados brutos do usuário para o intervalo [0, 1] usando min-max scaling, retornando as features no formato esperado pelo tensor de treinamento.
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
