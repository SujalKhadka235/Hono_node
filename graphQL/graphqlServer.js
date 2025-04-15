import { Hono } from "hono";
import { ApolloServer, gql } from "apollo-server-express";
import axios from "axios";
import express from "express";

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
  }

  type Query {
    users: [User]
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      try {
        const response = await axios.get("http://localhost:7272/users");
        return response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Error fetching users from external API");
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  next();
});

async function startServer() {
  await server.start();

  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(7273, () => {
    console.log("Server running at http://localhost:7273/graphql");
  });
}

startServer();
