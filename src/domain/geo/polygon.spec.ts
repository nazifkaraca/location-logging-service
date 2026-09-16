import {
  boundingBoxPolygon,
  MAX_POLYGON_VERTICES,
  validatePolygonCoordinates,
} from './polygon';

describe('validatePolygonCoordinates', () => {
  it('accepts a closed bounding box in [lng, lat] order', () => {
    const result = validatePolygonCoordinates(
      boundingBoxPolygon(29.0, 40.9, 29.1, 41.0),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects an unclosed ring', () => {
    const result = validatePolygonCoordinates([
      [
        [29, 41],
        [29.1, 41],
        [29.1, 41.1],
        [29, 41.1],
      ],
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/closed/i);
    }
  });

  it('rejects latitude out of range', () => {
    const result = validatePolygonCoordinates([
      [
        [29, 91],
        [29.1, 91],
        [29.1, 92],
        [29, 92],
        [29, 91],
      ],
    ]);
    expect(result.ok).toBe(false);
  });

  it('rejects too many vertices', () => {
    const ring: number[][] = [];
    for (let i = 0; i < MAX_POLYGON_VERTICES; i += 1) {
      ring.push([29 + i * 0.00001, 41]);
    }
    ring.push(ring[0]);
    const result = validatePolygonCoordinates([ring]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/256/);
    }
  });
});
