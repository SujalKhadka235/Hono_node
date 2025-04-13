import { db } from "../db/client.js";
import { usersTable } from "../db/schema.js";
import type { createUserType } from "../types/createUserType.js";
export const createUser = async (userSchema: createUserType) => {
  const createdUser = await db.insert(usersTable).values(userSchema);
  return createdUser;
};
