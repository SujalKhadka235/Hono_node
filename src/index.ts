import { serve } from "@hono/node-server";
import { Hono } from "hono";
import dotenv from "dotenv";
import userRoute from "./routes/user.routes.js";
dotenv.config();
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
app.route("/users", userRoute);
