import { Hono } from "hono";
import * as userController from "../controller/user.controller.js";
const userRoute = new Hono();
userRoute.get("/", userController.getAllUsers);
export default userRoute;
