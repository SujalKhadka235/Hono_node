import { badTokenTable, usersTable } from "../db/schema.js";
import { db } from "../db/client.js";
import { createUser } from "../services/user.service.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Context } from "hono";
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

export const logOutUserController = async (c: any) => {
  try {
    const authHeader = await c.req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return c.json({ msg: "token missing" }, 400);
    }
    const token = authHeader.split(" ")[1];
    await db.insert(badTokenTable).values({
      token: token,
    });
    return c.json({ msg: "logged out Sucessfully" }, 200);
  } catch (e) {
    console.log(e);
    return c.json({ message: "something went wrong here" });
  }
};

export const getProfileController = async (c: any) => {
  try {
    const userID = c.get("userID");
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userID));
    if (!user) {
      return c.json(
        { msg: "User associated with token no longer exists" },
        400
      );
    }
    return c.json({ yourProfile: user[0] }, 200);
  } catch (e) {
    console.log(e);
    return c.json({ msg: "Internal server error" }, 500);
  }
};
