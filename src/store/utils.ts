import Graphic from 'esri/Graphic';
import { Point, Multipoint, Polyline, Polygon } from 'esri/geometry';
import { SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol } from 'esri/symbols';
import { Geometry } from 'geojson';
import { Builder, Token } from 'lunr';
import lunr from 'lunr';
import ArcGISParser from 'terraformer-arcgis-parser';

export function esriGeometry(geometry: Geometry): ArcGISParser.Geometry {
  return ArcGISParser.convert(geometry);
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
