import express from "express";

import { login, signup, sendotp,picture, changePassword} from "../controllers/Auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/signup",signup);

router.post("/sendotp", sendotp);

router.post("/picture", picture);

router.post("/password",auth, changePassword);

export default router;
