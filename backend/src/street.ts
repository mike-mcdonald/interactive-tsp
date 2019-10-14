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

/**
 * This defines a basic set of data for our Star Wars Schema.
 *
 * This data is hard coded for the sake of the demo, but you could imagine
 * fetching this data from a backend service rather than from hardcoded
 * JSON objects in a more complex demo.
 */

/**
 * These are Flow types which correspond to the schema.
 * They represent the shape of the data visited during field resolution.
 */
export type Street = {
  id: string;
  name: string;
  classification: Classification;
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
    classification: {
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
          classification: {
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

export async function getStreets(bbox: BBox): Promise<Street[] | null> {
  if (area(bboxPolygon(bbox)) > 200000) {
    throw new Error('bounding box is too big');
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
          classification: {
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
