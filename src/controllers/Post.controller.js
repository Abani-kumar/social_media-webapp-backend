import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import Comment from "../models/Comment.model.js";
import uploadMedia from "../utils/uploadMedia.js";

export const createPost = async (req, res) => {
  try {
    const { content, hashtags } = req.body;
    const images = req.files?.images;
    const id = req.user.id;

    // console.log("images",images)
    // console.log("content",content)
    if (!content && !images) {
      return res.status(401).json({
        success: false,
        message: "Please fill atleast text or image",
      });
    }

    let result = [];
    if (images) {
      if (images.length > 1) {
        for (const image of images) {
          const uploadedMedia = await uploadMedia(image);
          if (uploadedMedia.secure_url) {
            result.push(uploadedMedia.secure_url);
          }
        }
      } else {
        const uploadedMedia = await uploadMedia(images);
        if (uploadedMedia.secure_url) {
          result.push(uploadedMedia.secure_url);
        }
      }
    }

    const newPost = await Post.create({
      user: id,
      content,
      hashtags,
      images: result,
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $push: { post: newPost._id } }
    );

    return res.status(200).json({
      success: true,
      message: "post created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: " Error in creating post",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { content, hashtags } = req.body;
    const images = req.files?.images;

    const id = req.params.id;

    if (!content && !hashtags && !images) {
      return res.status(401).json({
        success: false,
        message: "Please update atleast one section",
      });
    }

    let result = [];
    if (images) {
      if (images.length > 1) {
        for (const image of images) {
          const uploadedMedia = await uploadMedia(image);
          if (uploadedMedia.secure_url) {
            result.push(uploadedMedia.secure_url);
          }
        }
      } else {
        const uploadedMedia = await uploadMedia(images);
        if (uploadedMedia.secure_url) {
          result.push(uploadedMedia.secure_url);
        }
      }
    }

    const updatePost = await Post.findOneAndUpdate(
      { _id: id },
      { content, hashtags, images: result }
    );

    const updatedPost = await Post.findOne({ _id: id }).populate({
      path: "likes",
      path: "comments",
      path: "views",
    });

    return res.status(200).json({
      success: true,
      message: "post updated successfully",
      updatedPost,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: " Error in creating post",
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const myId = req.user.id;

    const existingLike = await Post.findOne({
      _id: postId,
      likes: { $in: [myId] },
    });

    if (existingLike) {
      return res.status(401).json({
        success: false,
        message: "you already like this post",
      });
    }

    const likePost = await Post.findByIdAndUpdate(
      { _id: postId },
      {
        $push: {
          likes: myId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "post liked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in post liking",
    });
  }
};

export const unLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const myId = req.user.id;

    const existingLike = await Post.findOne({
      _id: postId,
      likes: { $in: [myId] },
    });

    if (!existingLike) {
      return res.status(401).json({
        success: false,
        message: "you not like this post",
      });
    }

    const unlikePost = await Post.findByIdAndUpdate(
      { _id: postId },
      {
        $pull: {
          likes: myId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "post unlike successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in post liking",
    });
  }
};

export const myAllPost = async (req, res) => {
  try {
    const myId = req.user.id;
    let post = [];
    post = await Post.find({ user: { $in: [myId] } }).populate("user");

    if (post.length === 0) {
      return res.status(200).json({
        success: true,
        message: "you don't have any post",
      });
    }
    return res.status(200).json({
      success: true,
      message: "my all post fetched successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in fetching my post",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const myId = req.user.id;

    const user = await User.findOne({ _id: myId });
    // console.log(user);

    let post = [];
    if (user.following.length === 0) {
      post = await Post.find({
        user: {
          $not: { $eq: myId },
        },
      })
        .populate([
          {
            path: "user",
            select:
              "firstName lastName email userName tagLine avatar shortBio portfolioUrl follower following post",
          },
          { path: "comments", populate: "subComment" },
        ])
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
    }
    if (user.following.length > 0) {
      // console.log(user.following);
      post = await Post.find({
        user: {
          $in: user.following,
        },
      })
        .populate([
          {
            path: "user",
            select:
              "firstName lastName email userName tagLine avatar shortBio portfolioUrl follower following post",
          },
          { path: "comments", populate: "subComment" },
        ])
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
    }
    console.log("post", post);
    return res.status(200).json({
      success: true,
      message: "post fetched successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in fetch all post",
    });
    console.error(error);
  }
};

export const allPostOfUser = async (req, res) => {
  try {
    const {userId} = req.body;

    const userPost = await User.findById({ _id: userId }).populate("post");

    return res.status(200).json({
      succcess: true,
      message: "all post fetch successfully",
      userPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in fetch all post of user",
    });
    console.error(error);
  }
};

export const postDetails = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId })
      .populate("user likes views")
      .populate({
        path: "comments",
        populate: {
          path: "user like reply",
        },
      });

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "post doesnot exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "post fetched successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in fetch post details of user",
    });
    console.error(error);
  }
};

//***********************************************************************************
//Testing pending
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOneAndDelete({
      _id: postId,
      user: req.user.id,
    });
    const deleteComment = await Comment.deleteMany({
      _id: { $in: post.comments },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error in post deletion",
    });
  }
};

export const savePost = async (req, res) => {
  try {
    const myId = req.user.id;
    const postId = req.params.id;

    const user = await User.findOne({ _id: myId, savedPost: postId });
    console.log("user", user);
    if (user) {
      return res.status(400).json({
        success: false,
        message: "you already saved this post",
      });
    }
    console.log("after");
    const savePost = await User.findOneAndUpdate(
      { _id: myId },
      { $push: { savedPost: postId } },
      { new: true }
    );

    if (!savePost) {
      return res.status(401).json({
        success: false,
        message: "user doesnot exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "post saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while save post",
    });
    console.error(error);
  }
};

export const unSavePost = async (req, res) => {
  try {
    const myId = req.user.id;
    const postId = req.params.id;

    const user = await User.findOne({ _id: myId, savedPost: postId });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "you not saved this post",
      });
    }

    const unsavePost = await User.findOneAndUpdate(
      { _id: myId },
      { $pull: { savedPost: postId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "unsave post successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while unsave post",
    });
    console.error(error);
  }
};

export const getAllSavePost = async (req, res) => {
  try {
    const userId = req.user.id;

    const { savedPost } = await User.findById(
      { _id: userId },
      { savedPost: 1 }
    );

    const savePost = await Post.find({ _id: { $in: savedPost } }).populate({
      path: "user",
      select: "_id avatar userName",
    });

    if (savePost.length === 0) {
      return res.status(401).json({
        success: false,
        message: "their is no saved post",
      });
    }

    return res.status(200).json({
      success: true,
      message: "successfully fetched all post",
      savePost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while fetching save post",
    });
    console.error(error);
  }
};

export const getPostById = async (req, res) => {
  try {
    // console.log("inside function fjhnfhnf")
    const { id } = req.body;
    // console.log(id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "postId is not recieved",
      });
    }
    const post = await Post.findById({ _id: id }).populate([
      {
        path: "user",
        select:
          "firstName lastName email userName tagLine avatar shortBio portfolioUrl follower following post",
      },
      {
        path: "comments",
        populate: [
          { path: "user", select: "userName avatar _id" },
          {
            path: "subComment",
            populate: { path: "user", select: "userName avatar" },
          },
        ],
      },
    ]);

    console.log("post", post);

    return res.status(200).json({
      success: true,
      message: "post fetched successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while fetching post",
    });
    console.error(error);
  }
};

export const getProfileAndPostById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing field",
      });
    }

    const result = await User.findById(id).select("-password").populate({path:"post",populate:{path:"user",select:"_id userName avatar"}});

    if (result.length === 0) {
      return res.status(400).json({
        success: false,
        message: "couldnot find by id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user and post find successfully by id",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while fetching user and post by id",
    });
    console.error(error);
  }
};

//confuse =maybe after aggregation pipeline
export const hashtags = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error in fetch trending hashtags",
    });
    console.error(error);
  }
};
