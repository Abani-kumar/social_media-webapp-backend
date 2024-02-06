import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  updateProfile,
  changePassword,
  follow,
  unfollow,
  searchUser
} from "../controllers/Profile.controller.js";

const router = express.Router();

router.post("/updateProfile", auth, updateProfile);
router.post("/changePassword",auth, changePassword);
router.post("/follow/:id",auth, follow);
router.post("/unfollow/:id",auth, unfollow);
router.get("/search",auth, searchUser);

export default router;
