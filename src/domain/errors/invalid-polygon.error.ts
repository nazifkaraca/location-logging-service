export class InvalidPolygonError extends Error {
  readonly name = 'InvalidPolygonError';

  constructor(message: string) {
    super(message);
  }
}
