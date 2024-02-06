import express from "express";
import { auth } from "../middlewares/auth.middleware.js";

import {
  createPost,
  updatePost,
  likePost,
  unLikePost,
  getAllPosts,
  allPostOfUser,
  postDetails,
  myAllPost,
  savePost,
  unSavePost,
  getAllSavePost,
  getPostById,
  getProfileAndPostById
} from "../controllers/Post.controller.js";

const router = express.Router();

router.post("/createPost", auth, createPost);
router.post("/updatePost/:id", auth, updatePost);
router.post("/like/:id", auth, likePost);
router.post("/unLike/:id", auth, unLikePost);
router.get("/Posts", auth, getAllPosts);
router.post("/userPosts", auth, allPostOfUser);
router.get("/userPost/:id", auth, postDetails);
router.get("/myPost", auth, myAllPost);
router.post("/savePost/:id", auth, savePost);
router.post("/unsavePost/:id", auth, unSavePost);
router.get("/getAllSavePost", auth, getAllSavePost);
router.post("/postById",auth,getPostById)
router.post("/userAndPostById",auth,getProfileAndPostById)

export default router;
