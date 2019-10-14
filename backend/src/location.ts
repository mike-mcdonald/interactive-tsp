import { GraphQLObjectType, GraphQLFloat, GraphQLNonNull } from 'graphql';

export type Location = {
  x: number;
  y: number;
};

export const locationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Location',
  description: 'A coordinate pair, or Point',
  fields: () => ({
    x: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The location along the x axis.'
    },
    y: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The location along the y axis.'
    }
  })
});
