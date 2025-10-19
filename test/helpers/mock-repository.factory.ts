import { BaseRepository } from '../../src/shared/interfaces';

export type MockRepository<T = any> = jest.Mocked<BaseRepository<T>>;

/**
 * Creates a mock repository with all methods mocked
 */
export function createMockRepository<T = any>(): MockRepository<T> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
