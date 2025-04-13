import { Hono } from "hono";
import * as userController from "../controller/user.controller.js";
const userRoute = new Hono();
userRoute.get("/", userController.getAllUsersController);
userRoute.post("/", userController.createUserController);
userRoute.post("/login", userController.loginUserController);
export default userRoute;
