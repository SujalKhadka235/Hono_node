import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { badTokenTable } from "../db/schema.js";
import type { Context, Next } from "hono";

import jwt from "jsonwebtoken";
export const validateToken = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return c.json({ message: "token is not attached to header" }, 400);
    }
    const token = authHeader.split(" ")[1];
    const isTokenBlackListed = await db
      .select()
      .from(badTokenTable)
      .where(eq(badTokenTable.token, token));
    if (isTokenBlackListed.length > 0) {
      return c.json(
        { message: "the token has expired or already been used" },
        400
      );
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userID: string;
    };
    if (!payload) {
      return c.json({ message: "This token is not valid" });
    }
    c.set("userID", payload.userID);
    await next();
  } catch (error) {
    console.log(error);
  }
};
