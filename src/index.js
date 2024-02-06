import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/database.config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import cloudinaryConnect from "./config/cloudinary.config.js";
import http from "http";
import { Server } from "socket.io";
import userRoute from "./routes/Auth.route.js";
import profileRoute from "./routes/Profile.route.js";
import fileUpload from "express-fileupload";
import PostRoute from "./routes/Post.route.js";
import commentRoute from "./routes/Comment.route.js";
import passport from "passport";
import cookieSession from "cookie-session";
import PassportAuthRoute from "./routes/PassportAuth.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_KEY],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/post", PostRoute);
app.use("/api/v1/comment", commentRoute);

app.use("/auth", PassportAuthRoute);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

io.on("connection", (socket) => {
  console.log(`user is connected to ${socket.id}`);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started at port no :${PORT}`);
});

connectDB();
cloudinaryConnect();
