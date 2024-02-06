import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

export const auth = async (req, res, next) => {
  try {
    // console.log(req)
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    const decoded=jwt.decode(token);
    const exppirationtime=decoded.exp;
    const currentTime = Math.floor(Date.now() / 1000)
     if(currentTime>exppirationtime){
        return res.status(404).json({
            Success:false,
            Message:"Session expired kindly relogin"
        })
     }
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
  }
  catch (error) {
    console.error(error.message);
    return res.status(401).json({
      success: false,
      message: "token is invalid",
    });
  }
  next();
};

// export default auth;
