import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";

export const createComment = async (req, res) => {
  //create comment
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status.json({
        success: false,
        message: "post not found",
      });
    }

    //create new comment
    const newComment = await Comment.create({
      postId,
      user: userId,
      content,
    });

    const updatedPost = await Post.findByIdAndUpdate(
      { _id: postId },
      { $push: { comments: newComment._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "comment created successfully",
      newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to create comment",
    });
    console.error(error);
  }
};

export const subComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!parentCommentId || !content) {
      return res.status(400).json({
        success: false,
        message: "missing field",
      });
    }

    const newSubComment = await Comment.create({
      user: userId,
      content,
    });

    const updatedComment = await Comment.findByIdAndUpdate(
      { _id: parentCommentId },
      { $push: { subComment: newSubComment._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "subcomment create successfully",
      newSubComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to create subcomment",
    });
    console.error(error);
  }
};

// export const likeComment=async(req,res)=>{
//   co
// }

export const updateComment = async (req, res) => {
  try {
  } catch (error) {}
};

export const deleteComment = async (req, res) => {
  try {
  } catch (error) {}
};
