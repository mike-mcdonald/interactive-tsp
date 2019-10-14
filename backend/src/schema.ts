// @flow strict

import { GraphQLSchema } from 'graphql';
import { GraphQLFloat, GraphQLString } from 'graphql';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType
} from 'graphql';

import { streetType, getStreet, getStreets } from './street';
import { addressType, getCandidates } from './address';

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
    address: {
      type: GraphQLList(addressType),
      description: 'Use portlandmaps.com geocoding to search Portland',
      args: {
        search: {
          description: 'search string to pass to the geocoding APIs',
          type: GraphQLString
        }
      },
      resolve: async (root, { search }) => {
        return await getCandidates(search);
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
          description:
            'Array of numbers representing a bounding box to return streets for',
          type: GraphQLList(GraphQLFloat)
        }
      },
      resolve: (root, { bbox }) => {
        if (bbox) {
          return getStreets(bbox);
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
  types: [streetType, addressType]
});
