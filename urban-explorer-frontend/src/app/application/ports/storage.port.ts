import { Result } from '@shared/types/result.type';

export interface IStoragePort {
  get<T>(key: string): Promise<Result<T | null>>;
  set<T>(key: string, value: T): Promise<Result<void>>;
  remove(key: string): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  keys(): Promise<Result<string[]>>;
}
