import axios from 'axios';
import bbox from '@turf/bbox';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt
} from 'graphql';
import { Street } from './street';
import { Feature, Geometry } from '@turf/helpers';

const URLS: Set<string> = new Set([
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
]);

export type Project = {
  id: string;
  name: string;
  number?: number;
  location?: string;
  description?: string;
  agency?: string;
  estimatedCost?: number;
  estimatedTimeframe?: string;
  district?: string;
  facilityOwner?: string;
  patternArea?: string;
  fundingCategory?: string;
  geometry: Geometry;
};

export const projectType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Project',
  description: 'A transportation project in the City of Portland',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The planning id of the project.'
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name given to of the project.'
    },
    number: {
      type: GraphQLInt,
      description: 'The internal number of the project'
    },
    location: {
      type: GraphQLString,
      description: 'An internal location description of the project'
    },
    description: {
      type: GraphQLString,
      description:
        'The description of what the project will accomplish when completed'
    },
    agency: {
      type: GraphQLString,
      description: 'The agency in charge of the project'
    },
    estimatedCost: {
      type: GraphQLFloat,
      description: 'An estimated cost to complete the project'
    },
    estimatedTimeframe: {
      type: GraphQLString,
      description:
        'The 10 year estimate group for when this project will be completed'
    },
    district: {
      type: GraphQLString,
      description: ''
    },
    facilityOwner: {
      type: GraphQLString,
      description:
        'The agency that controls the facility affected by this project'
    },
    patternArea: {
      type: GraphQLString,
      description: 'Which pattern area this project affects'
    },
    fundingCategory: {
      type: GraphQLString,
      description: ''
    }
  })
});

export async function getProjects(street: Street) {
  const box = bbox(street.geometry);

  const projects = new Array<Project>();

  for (const url of URLS) {
    const res = await axios
      .get(`${url}/query`, {
        params: {
          f: 'geojson',
          geometryType: 'esriGeometryEnvelope',
          geometry: box.join(','),
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
      const data: Feature<Geometry>[] = res.data.features;

      projects.push(
        ...data.map((value: Feature<Geometry>) => {
          let project: Project = {
            id: value.properties ? value.properties.TranPlanID : 'null',
            name: value.properties ? value.properties.ProjectName : 'null',
            number: value.properties ? value.properties.ProjectNumber : 'null',
            location: value.properties
              ? value.properties.ProjectLocation
              : 'null',
            description: value.properties
              ? value.properties.ProjectDescription
              : 'null',
            agency: value.properties ? value.properties.LeadAgency : 'null',
            estimatedCost: value.properties
              ? value.properties.EstimatedCost
              : 'null',
            estimatedTimeframe: value.properties
              ? value.properties.EstimatedTimeframe
              : 'null',
            district: value.properties ? value.properties.TSPDistrict : 'null',
            facilityOwner: value.properties
              ? value.properties.FacilityOwner
              : 'null',
            patternArea: value.properties
              ? value.properties.PatternArea
              : 'null',
            fundingCategory: value.properties
              ? value.properties.TSPFundingCategory
              : 'null',
            geometry: value.geometry
          };

          return project;
        })
      );
    }
  }

  return projects;
}
