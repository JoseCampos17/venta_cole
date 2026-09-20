export type AppError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'VALIDATION'; message: string; fields?: Record<string, string> }
  | { type: 'INSUFFICIENT_STOCK'; message: string; productId?: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'CONFLICT'; message: string }
  | { type: 'INTERNAL'; message: string };

export class ServiceError extends Error {
  constructor(
    public readonly appError: AppError,
    message?: string
  ) {
    super(message ?? appError.message);
    this.name = 'ServiceError';
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}
