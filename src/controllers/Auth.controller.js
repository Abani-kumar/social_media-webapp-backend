import User from "../models/User.model.js";
import dotenv from "dotenv";
import uploadToCloudinary from "../utils/uploadMedia.js";
import Otp from "../models/Otp.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

dotenv.config({
  path: "./.env",
});

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, tagLine, userName, email, password, otp } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !tagLine ||
      !userName ||
      !email ||
      !password ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Kindly fill all field",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User with email or username already exists",
      });
    }

    const response = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length == 0) {
      return res.status(401).json({
        success: false,
        message: "The otp is invalid",
      });
    }
    if (otp != response[0].otp) {
      return res.status(401).json({
        success: false,
        message: "The otp is invalid",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      userName: userName,
      tagLine: tagLine,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "user registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Kindly fill all field",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You are not registered,please registered first",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      user.token = token;
      user.password = undefined;

      // console.log("userId",user.id)
      // console.log("user", user);

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      await User.findOneAndUpdate({ email }, { tokenCreated: Date.now() });

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Please fill email section",
      });
    }

    const { user } = User.findOne({ email });

    if (user) {
      return res.status(401).json({
        success: false,
        message: "User is Already Registered",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const result = await Otp.findOne({ otp: otp });
    console.log("otp result", otp);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    const otpPayload = { email, otp };
    const otpBody = Otp.create(otpPayload);
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: " Error in otp sending",
    });
  }
};

export const picture = async (req, res) => {
  try {
    const { email } = req.body;
    const profilePicture = req.files.profilePicture;

    if (!email || !profilePicture) {
      return res.status(401).json({
        success: false,
        message: "please fill all details",
      });
    }

    const uploadMedia = await uploadToCloudinary(profilePicture);

    const user = await User.findOneAndUpdate(
      { email },
      { avatar: uploadMedia.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "profile picture uploaded",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: " Error in otp sending",
    });
  }
};

export const changePassword=async(req,res)=>{
  try{
    const {oldPassword,newPassword,confirmPassword}=req.body;

    if(newPassword!==confirmPassword){
      return res.status(400).json({
        success:false,
        message:"new password and confirm password must same"
      })
    }

    if(oldPassword===newPassword){
      return res.status(400).json({
        success:false,
        message:"new password and old password must not same"
      })
    }

    const userDetails=await User.findById(req.user.id);

    const isPasswordMatch=await bcrypt.compare(oldPassword,userDetails.password);

    if(!isPasswordMatch){
      return res.status(400).json({
        success:false,
        message:"the password you give is wrong password"
      })
    }

    const encryptedPassword=await bcrypt.hash(newPassword,10);
    const updatedUser=await User.findByIdAndUpdate({_id:req.user.id},{password:encryptedPassword},{new:true});

    return res.status(200).json({
      success:true,
      message:"password updated successfully"
    })

  }
  catch(error){
    console.error(error);
    return res.status(500).json({
      success: false,
      message: " Error in password updation",
    });
  }
}
