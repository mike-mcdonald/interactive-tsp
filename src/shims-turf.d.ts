declare module '@turf/centroid' {
  import { Units, Coord, Feature, GeoJSONObject, Point, AllGeoJSON } from '@turf/helpers';
  function centroid(geojson: AllGeoJSON, properties?: any): Feature<Point>;
  export default centroid;
}

declare module '@turf/nearest-point-on-line' {
  import { Geometry, Feature, LineString, MultiLineString, Point, Units } from '@turf/helpers';
  function nearestPointOnLine(
    lines: Geometry | Feature<LineString | MultiLineString>,
    pt: Geometry | Feature<Point> | Array<number>,
    options: { units?: Units }
  ): Feature<Point>;
  export default nearestPointOnLine;
}
