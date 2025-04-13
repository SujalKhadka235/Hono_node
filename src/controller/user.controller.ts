import { usersTable } from "../db/schema.js";
import { db } from "../db/client.js";

export const getAllUsers = async (c) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
};
