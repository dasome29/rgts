import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";

import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";


import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
  // sendEmail('dasome29@hotmail.com', 'Hola, David wapo leyendo esto.');
  const connection = await createConnection({
    type: "postgres",
    database: "rgts_database",
    username: "postgres",
    password: "davidsolis",
    logging: true,
    synchronize: true,
    entities:[User, Post]
  });
//   connection.connect();
  // await orm.em.nativeDelete(User, {});

  const app = express();

  const RedisStore = connectRedis(session);

  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "iahsdbfvihbdihsbdcfo",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(8000, () => {
    console.log("server started on localhost:8000");
  });
};
main();
