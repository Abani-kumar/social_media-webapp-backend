import express from "express";
import passport from "../controllers/passport.controller.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.model.js";

const FRONTEND_URL = "http://localhost:3000";

dotenv.config({
  path: "./.env",
});

const router = express.Router();

//Frontend call this and this open a popup type email choose an account to continue
router.get("/google", passport.authenticate("google", { scope: ["email"] }));

//Now after chhosing one this call either for a success redirect or failure redirect
router.get("/google/callback",passport.authenticate("google", 
  {
    successRedirect: "/auth/google/login/success",
    failureRedirect: "/login/failed",
  })
);


router.get("/github", passport.authenticate("github", { scope: ["email"] }));

router.get("/github/callback",passport.authenticate("github", 
  {
    successRedirect: "/auth/google/login/success",
    failureRedirect: "/login/failed",
  })
);

let user;
let token;

//success redirect
router.get("/google/login/success", async (req, res) => {
  try {
    const email = req?.user?._json.email;
    const userFound = await User.findOne({ email: email });
    user = userFound;
    if (userFound) {
      userFound.password = undefined;
      const payload = { email: userFound.email, id: userFound._id };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
    }
    return res.redirect(`${FRONTEND_URL}/socialLogin`);
  } catch (error) {
    console.log(error);
  }
});

//if success then it gives userdetails
router.get("/login/userdetails", (req, res) => {
  res.status(200).json({
    token: token,
    user: user,
  });
});


//failure redirect
router.get("/login/failed", (req, res) => {
  res.redirect(FRONTEND_URL);
});



export default router;
