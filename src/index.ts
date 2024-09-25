import 'dotenv/config'
import express from 'express';
import cookie_parser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import './strategies/google-strategy'

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser());
app.use(
    session({
        secret: 'secret',
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        },
    })
)

app.use(passport.initialize());
app.use(passport.session());

app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    }),
    (req, res) => {
      if (!req.user) {
        res.status(400).json({ error: "Authentication failed" });
      }
    //   console.log(req.session);
      res.status(200).json(req.user);
    }
  );

app.listen(process.env.PORT, () => console.log('server is running'));