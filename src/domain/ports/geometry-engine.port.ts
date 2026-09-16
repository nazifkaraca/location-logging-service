export interface GeometryEngine {
  assertValidPolygon(geojson: string): Promise<void>;
}
