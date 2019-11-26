// @flow strict

import { GraphQLSchema, GraphQLInt } from 'graphql';
import { GraphQLFloat, GraphQLString } from 'graphql';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { streetType, getStreet, getStreets } from './street';
import { addressType, getCandidates } from './address';
import { sectionType, getText, Section } from './text';
import { projectType, getProjectsById } from './project';

/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *
 *   }
 *
 */
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    sections: {
      type: GraphQLList(sectionType),
      description: 'Sections that make up the Transportation system plan',
      resolve: async (): Promise<Section[]> => await getText()
    },
    address: {
      type: GraphQLList(addressType),
      description: 'Use portlandmaps.com geocoding to search Portland',
      args: {
        search: {
          description: 'search string to pass to the geocoding APIs',
          type: GraphQLString
        },
        city: {
          description: 'Limit the results to a specific city.',
          type: GraphQLString
        }
      },
      resolve: async (root, { search, city }) => {
        return await getCandidates(search, city);
      }
    },
    project: {
      type: GraphQLList(projectType),
      description: 'Find a project in Portland by a PBOT planning ID',
      args: {
        id: {
          description: 'Transportation planning id of the project',
          type: GraphQLString
        }
      },
      resolve: (root, { id }) => {
        if (id) {
          return getProjectsById(id);
        }
      }
    },
    street: {
      type: streetType,
      description: 'Find a street in Portland by a PBOT planning ID',
      args: {
        id: {
          description: 'Transportation planning id of the street',
          type: GraphQLString
        }
      },
      resolve: (root, { id }) => {
        if (id) {
          return getStreet(id);
        }
      }
    },
    streets: {
      type: GraphQLList(streetType),
      description: 'Find streets in Portland by using a bounding box',
      args: {
        bbox: {
          description: 'Array of numbers representing a bounding box to return streets for',
          type: GraphQLList(GraphQLFloat)
        },
        spatialReference: {
          description: 'The spatial reference well-known ID ("wkid").',
          type: GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: (root, { bbox, spatialReference }) => {
        if (bbox) {
          return getStreets(bbox, spatialReference);
        }
      }
    }
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export default new GraphQLSchema({
  query: queryType,
  types: [streetType, addressType, projectType, sectionType]
});
