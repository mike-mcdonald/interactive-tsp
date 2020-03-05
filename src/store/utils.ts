import { Geometry } from '@turf/helpers';
import Graphic from 'esri/Graphic';
import { Point, Multipoint, Polyline, Polygon } from 'esri/geometry';
import { SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol } from 'esri/symbols';
import { Builder, Token } from 'lunr';
import lunr from 'lunr';

export function esriGeometry(geometry: Geometry): __esri.Geometry | undefined {
  let esriProperties = { spatialReference: { wkid: 4326 } };

  switch (geometry.type) {
    case 'Point':
      esriProperties = Object.assign(esriProperties, { x: geometry.coordinates[0], y: geometry.coordinates[1] });
      break;
    case 'LineString':
      esriProperties = Object.assign(esriProperties, { paths: [geometry.coordinates] });
      break;
    case 'Polygon':
      esriProperties = Object.assign(esriProperties, { rings: geometry.coordinates });
      break;
    case 'MultiPoint':
      esriProperties = Object.assign(esriProperties, { points: geometry.coordinates });
      break;
    case 'MultiLineString':
      esriProperties = Object.assign(esriProperties, { paths: geometry.coordinates });
      break;
    case 'MultiPolygon':
      esriProperties = Object.assign(esriProperties, { rings: [geometry.coordinates] });
      break;
  }

  return esriProperties as __esri.Geometry;
}

export function esriGraphics(geometry: Geometry): Graphic[] {
  const fillColor = '#bfe7eb';
  const outlineColor = '#00484e';

  switch (geometry.type) {
    case 'Point':
      return [
        new Graphic({
          geometry: new Point(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: fillColor,
            outline: {
              color: outlineColor,
              width: 2
            }
          })
        })
      ];
    case 'MultiPoint':
      return [
        new Graphic({
          geometry: new Multipoint(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: fillColor,
            outline: {
              color: outlineColor,
              width: 2
            }
          })
        })
      ];
    case 'LineString':
    case 'MultiLineString':
      return [
        new Graphic({
          geometry: new Polyline(esriGeometry(geometry)),
          symbol: new SimpleLineSymbol({
            color: outlineColor,
            width: 10
          })
        }),
        new Graphic({
          geometry: new Polyline(esriGeometry(geometry)),
          symbol: new SimpleLineSymbol({
            color: fillColor,
            width: 8
          })
        })
      ];
    case 'Polygon':
    case 'MultiPolygon':
      return [
        new Graphic({
          geometry: new Polygon(esriGeometry(geometry)),
          symbol: new SimpleFillSymbol({
            color: fillColor,
            outline: {
              color: outlineColor,
              width: 2
            }
          })
        })
      ];
    default:
      return [];
  }
}

const customWordMap = new Map<string, string>([
  ['bicycle', 'bike'],
  ['bikeway', 'bike'],
  ['walkway', 'walk']
]);

export function customStemming(builder: Builder) {
  // Define a pipeline function that converts 'gray' to 'grey'
  var pipelineFunction = function(token: Token) {
    if (customWordMap.has(token.toString())) {
      return token.update(function() {
        return customWordMap.get(token.toString());
      });
    } else {
      return token;
    }
  };

  // Register the pipeline function so the index can be serialised
  lunr.Pipeline.registerFunction(pipelineFunction, 'customStemming');

  // Add the pipeline function to both the indexing pipeline and the
  // searching pipeline
  builder.pipeline.before(lunr.stemmer, pipelineFunction);
  builder.searchPipeline.before(lunr.stemmer, pipelineFunction);
}
