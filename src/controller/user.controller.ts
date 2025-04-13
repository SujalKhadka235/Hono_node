import { usersTable } from "../db/schema.js";
import { db } from "../db/client.js";
import { createUser } from "../services/user.service.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const getAllUsersController = async (c: any) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
};

export const createUserController = async (c: any) => {
  const userBody = await c.req.json();
  const { email, password } = userBody;
  const doesUserExist = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (doesUserExist.length > 0) {
    return c.json({ message: "user already exists" }, 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userToBeCreated = { ...userBody, password: hashedPassword };
  const createdUser = await createUser(userToBeCreated);
  return c.json({ msg: "User has been created", createdUser: createdUser });
};
export const loginUserController = async (c: any) => {
  try {
    const loginBody = await c.req.json();
    const { email, password } = loginBody;
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existingUser.length == 0) {
      return c.json({ msg: "email does not exist" }, 400);
    }
    const doesPasswordMatch = await bcrypt.compare(
      password,
      existingUser[0].password
    );
    if (!doesPasswordMatch) {
      return c.json({ msg: "password does not match" }, 400);
    }
    const token = jwt.sign(
      { userID: existingUser[0].id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return c.json(
      {
        message: "Sucessfully logged in",
        token: token,
      },
      200
    );
  } catch (e) {
    console.log(e);
  }
};
