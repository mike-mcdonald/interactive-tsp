import {
  GraphQLFloat,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

export const lineStringType: GraphQLObjectType = new GraphQLObjectType({
  name: 'LineString',
  description: 'A GeoJSON LineString',
  fields: () => ({
    type: {
      type: GraphQLString,
      description: 'The type of GeoJSON object. Here it is always "LineString"'
    },
    coordinates: {
      type: GraphQLList(GraphQLList(GraphQLFloat)),
      description:
        'The array of coordinate pairs that make up the points in the line'
    }
  })
});

export const pointType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Point',
  description: 'A GeoJSON LineString',
  fields: () => ({
    type: {
      type: GraphQLString,
      description: 'The type of GeoJSON object. Here it is always "Point"'
    },
    coordinates: {
      type: GraphQLList(GraphQLFloat),
      description: 'The coordinate pair that make up the point'
    }
  })
});
