// @flow strict
import axios from 'axios';

import {
  featureCollection,
  BBox,
  Geometry,
  Point,
  Feature,
  LineString
} from '@turf/helpers';
import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import { unknownArgMessage } from 'graphql/validation/rules/KnownArgumentNames';
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList
} from 'graphql';
import proj4 from 'proj4';

import { projectType, getProjects } from './project';

const URLS: Set<string> = new Set([
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19'
]);

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

export type Street = {
  id: string;
  name: string;
  classifications: Classification;
  projects?: Array<string>;
  geometry: LineString;
};

export type Classification = {
  traffic?: string;
  transit?: string;
  bicycle?: string;
  pedestrian?: string;
  freight?: string;
  emergency?: string;
  design?: string;
  greenscape?: string;
};

export const classificationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Classification',
  description:
    'An object describing the combined classifications of a street in the City of Portland',
  fields: () => ({
    traffic: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    transit: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    bicycle: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    pedestrian: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    freight: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    emergency: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    design: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    },
    greenscape: {
      type: GraphQLString,
      description: 'The planning id of the street.'
    }
  })
});

/**
 * Streets combine segments that have a planning ID associated with them from the Transportation System Plan
 *
 */
export const streetType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Street',
  description: 'A segment in the City of Portland',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The PBOT planning id of the street.'
    },
    name: {
      type: GraphQLString,
      description: 'The full name of the street.'
    },
    classifications: {
      type: classificationType,
      description: 'The list of classifications associated with this street'
    },
    projects: {
      type: GraphQLList(projectType),
      description:
        'The projects that intersect with the bounding box of this street',
      resolve: (street: Street) => getProjects(street)
    }
  })
});

/**
 * Helper function to get a character by ID.
 */
export async function getStreet(id: string): Promise<Street | null> {
  // Returning a promise just to illustrate GraphQL.js's support.
  for (const url of URLS) {
    const res = await axios
      .get(`${url}/query`, {
        params: {
          f: 'geojson',
          where: `TranPlanID='${id}'`,
          outSR: '4326',
          outFields: '*'
        }
      })
      .catch(err => {
        throw new Error(err);
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data = res.data.features[0];

      if (data) {
        return {
          id: data.properties.TranPlanID,
          name: data.properties.StreetName,
          geometry: data.geometry,
          classifications: {
            traffic: data.properties.Traffic,
            transit: data.properties.Transit,
            bicycle: data.properties.Bicycle,
            pedestrian: data.properties.Pedestrian,
            freight: data.properties.Freight,
            emergency: data.properties.Emergency,
            design: data.properties.Design,
            greenscape: data.properties.Greenscape
          }
        };
      }
    }
  }

  return null;
}

export async function getStreets(bbox: BBox, spatialReference: number): Promise<Street[] | null> {
  [bbox[0], bbox[1]] = proj4(`${spatialReference}`, 'EPSG:4326', [bbox[0], bbox[1]]);
  [bbox[2], bbox[3]] = proj4(`${spatialReference}`, 'EPSG:4326', [bbox[2], bbox[3]]);

  if (area(bboxPolygon(bbox)) > 250000) {
    throw new Error(`bounding box is too big: ${area(bboxPolygon(bbox))}`);
  }

  for (const url of URLS) {
    const res = await axios
      .get(`${url}/query`, {
        params: {
          f: 'geojson',
          geometryType: 'esriGeometryEnvelope',
          geometry: bbox.join(','),
          spatialRel: 'esriSpatialRelIntersects',
          inSR: '4326',
          outSR: '4326',
          outFields: '*'
        }
      })
      .catch(err => {
        throw new Error(err);
      });

    if (res.status == 200 && res.data && res.data.features) {
      const data: Feature<LineString>[] = res.data.features;

      return data.map((value: Feature<LineString, any>) => {
        const street: Street = {
          id: value.properties ? value.properties.TranPlanID : 'null',
          name: value.properties ? value.properties.StreetName : 'null',
          geometry: value.geometry,
          classifications: {
            traffic: value.properties.Traffic,
            transit: value.properties.Transit,
            bicycle: value.properties.Bicycle,
            pedestrian: value.properties.Pedestrian,
            freight: value.properties.Freight,
            emergency: value.properties.Emergency,
            design: value.properties.Design,
            greenscape: value.properties.Greenscape
          }
        };

        return street;
      });
    }
  }

  return null;
}
