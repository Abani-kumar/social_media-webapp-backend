import User from "../models/User.model.js";
import dotenv from "dotenv";
import uploadToCloudinary from "../utils/uploadMedia.js";
import bcrypt from "bcrypt";

dotenv.config({
  path: "./.env",
});

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, userName, tagLine, shortBio, portfolioUrl } =
      req.body;
    const id = req.user.id;
    const profilePicture = req?.files?.profilePicture;
    
  console.log("username",userName)

    if (
      !firstName &&
      !lastName &&
      !userName &&
      !tagLine &&
      !shortBio &&
      !portfolioUrl &&
      !profilePicture
    ) {
      return res.status(401).json({
        success: false,
        message: "Atleast fill one field to update profile",
      });
    }

    
    if (userName) {
      const existingUser = await User.findOne({
        userName: userName,
      });
    
      // If an existing user is found, return a response indicating a conflict
      if (existingUser) {
        return res.status(401).json({
          success: false,
          message: "Username already exists. Please choose a different username.",
        });
      }
    }
    
    let upload;
    if (profilePicture) {
      upload = await uploadToCloudinary(profilePicture);
      if (!upload) {
        return res.status(401).json({
          success: false,
          message: "error in cloudinary update",
        });
      }
    }

    const updatedUserDetails = await User.findByIdAndUpdate(
      { _id: id },
      {
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        tagLine: tagLine,
        shortBio: shortBio,
        portfolioUrl: portfolioUrl,
        avatar: upload?.secure_url,
      },
      { new: true }
    );
    updatedUserDetails.password=undefined

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: " Error in updating profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    // console.log("password",password)
    // console.log("newpassword",newPassword)
    const id = req.user.id;

    if (!password || !newPassword ) {
      return res.status(401).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    if (password === newPassword) {
      return res.status(400).json({
        Success: false,
        Message: "Your newpassword and currentpassword should be different",
      });
    }

    const userDetails = await User.findById({ _id: id });

    const isPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password
    );

    console.log("Abani");
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The password is not matching",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUserDetails = await User.findByIdAndUpdate(
      { _id: id },
      { password: encryptedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error in password updation",
      error: error.message,
    });
  }
};

// ***********************************HOMEWORK**********************************************

export const follow = async (req, res) => {
  try {
    const userId = req.params.id;
    const myId = req.user.id;

    const newUser = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { follower: myId } },
      { new: true }
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: myId },
      { $push: { following: userId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `you followed ${newUser.userName}`,
      updatedUser,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error in following",
      error: error.message,
    });
  }
};

export const unfollow = async (req, res) => {
  try {
    const userId = req.params.id;
    const myId = req.user.id;

    const user = await User.findOne({ _id: userId, follower: { $in: [myId] } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "you not follow this user",
      });
    }

    const newUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { follower: myId } },
      { new: true }
    );

    const updatedUser = await User.findByIdAndUpdate(
      { _id: myId },
      { $pull: { following: userId } }
    );

    return res.status(200).json({
      success: true,
      message: `you unfollowed ${newUser.userName}`,
      updatedUser,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error in unfollowing",
      error: error.message,
    });
  }
};

export const searchUser = async (req, res) => {
  try {
    const userName = req.body;

    const users = await User.find(userName).limit(10);

    if (users?.length == 0) {
      return res.status(401).json({
        success: false,
        message: "users cannot find with this username",
      });
    }

    return res.status(201).json({
      success: true,
      message: "users find successfully",
      users,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error in searching user",
      error: error.message,
    });
  }
};

// ************************************************************************************
// ***********************************Home Work****************************************
// ************************************************************************************

export const suggestionsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const users = await User.findById({ _id: userId }).populate();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Error in suggesting user",
      error: error.message,
    });
  }
};
