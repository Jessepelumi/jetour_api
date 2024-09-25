import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../utils/prisma";

interface User {
    id: string;
    email: string;
    googleId: string;
    name: string;
    image: string;
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user:  User | null | false, done) => {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.APPURL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile?.emails?.[0]?.value ?? '';
            const emailVerified = profile?.emails?.[0]?.verified ?? false;
            const picture = profile?.photos?.[0]?.value ?? '';

            let findUser;

            try {
                findUser = await prisma.user.findFirst({
                    where: {
                        googleId: profile.id
                    }
                })
            } catch (err) {
               return done(err, undefined);
            }

            try {
                if (!findUser) {
                    const newUser = await prisma.user.create({
                        data: {
                            name: profile.displayName,
                            email: email,
                            email_verified: emailVerified,
                            image: picture,
                            googleId: profile.id
                        },
                    });
                  return done(null, newUser);
                }
                return done(null, findUser);
            } catch (err) {
                console.log(err);
                return done(err, undefined)
                
            }
        }
    )
);

export default passport;
