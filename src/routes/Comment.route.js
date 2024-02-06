import express from "express";
import {createComment,subComment} from "../controllers/Comment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router=express.Router();

router.post("/createComment",auth,createComment);
router.post("/createSubComment",auth,subComment);

export default router;
