import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    tagLine: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: [true, "Password is required"],
    },
    avatar: {
      type: String,
      required:true,
    },
    shortBio: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    tokenCreated:{
      type:Date,
      default:null
    },
    resetPasswordExpires: {
      type: Date,
      default:null
    },
    role: {
      type: String,
      enum: ["User"],
    },
    follower:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    ],
    following:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    ],
    post: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
