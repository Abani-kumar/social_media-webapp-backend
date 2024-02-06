import google from "passport-google-oauth20";
import github from "passport-github2";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const GoogleStrategy=google.Strategy;

const GithubStrategy=github.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, email, done) {
      done(null, email);
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken, refreshToken, email, done) {
      done(null, email);
    }
  )
);

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

export default passport;
