import express from 'express';
import graphqlHTTP from 'express-graphql';
import cors from 'cors';

import schema from './schema';

var app = express();

app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: schema.getQueryType(),
  graphiql: true,
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));