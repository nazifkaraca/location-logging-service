export const MAX_POLYGON_VERTICES = 256;

export type LinearRing = number[][];
export type PolygonCoordinates = LinearRing[];

export type PolygonValidationError = {
  ok: false;
  message: string;
};

export type PolygonValidationSuccess = {
  ok: true;
  coordinates: PolygonCoordinates;
};

export type PolygonValidationResult =
  PolygonValidationSuccess | PolygonValidationError;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPosition(value: unknown): value is [number, number] {
  if (!Array.isArray(value) || value.length < 2) {
    return false;
  }
  const lng = value[0];
  const lat = value[1];
  if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) {
    return false;
  }
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

function samePosition(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function validateRing(
  ring: unknown,
  ringIndex: number,
): PolygonValidationResult {
  if (!Array.isArray(ring)) {
    return {
      ok: false,
      message: `Ring ${ringIndex} must be an array of positions`,
    };
  }
  if (ring.length < 4) {
    return {
      ok: false,
      message: `Ring ${ringIndex} must have at least 4 positions (closed LinearRing)`,
    };
  }

  const positions: [number, number][] = [];
  for (let i = 0; i < ring.length; i += 1) {
    const position = ring[i];
    if (!isPosition(position)) {
      return {
        ok: false,
        message: `Ring ${ringIndex} position ${i} must be [longitude, latitude]`,
      };
    }
    positions.push([position[0], position[1]]);
  }

  const first = positions[0];
  const last = positions[positions.length - 1];
  if (!samePosition(first, last)) {
    return {
      ok: false,
      message: `Ring ${ringIndex} must be closed (first position equals last)`,
    };
  }

  return { ok: true, coordinates: [positions] };
}

export function validatePolygonCoordinates(
  value: unknown,
): PolygonValidationResult {
  if (!Array.isArray(value) || value.length === 0) {
    return {
      ok: false,
      message: 'polygon must be a GeoJSON Polygon coordinates array',
    };
  }

  let vertexCount = 0;
  const rings: LinearRing[] = [];

  for (let i = 0; i < value.length; i += 1) {
    const result = validateRing(value[i], i);
    if (!result.ok) {
      return result;
    }
    const ring = result.coordinates[0];
    vertexCount += ring.length;
    rings.push(ring);
  }

  if (vertexCount > MAX_POLYGON_VERTICES) {
    return {
      ok: false,
      message: `polygon exceeds ${MAX_POLYGON_VERTICES} vertices`,
    };
  }

  return { ok: true, coordinates: rings };
}

export function toGeoJsonPolygon(coordinates: PolygonCoordinates): string {
  return JSON.stringify({ type: 'Polygon', coordinates });
}

export function boundingBoxPolygon(
  west: number,
  south: number,
  east: number,
  north: number,
): PolygonCoordinates {
  return [
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
  ];
}
