import NextAuth from "next-auth";
import User from "./models/userModel";
import {connect} from "./dbConfig/dbConfig";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";

export const {handlers, signIn, signOut, auth} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        connect();

        const {email, password} = credentials;
        const user = await User.findOne({email});
        console.log(user);
        if (user) {
          const validPassword = await bcryptjs.compare(password, user.password);
          if (!validPassword) {
            return null;
          }
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
    Google,
    GitHub,
  ],
  callbacks: {
    async jwt({token, user, session}) {
      if (user) {
        return {...token, id: user._id};
      }
      return token;
    },
    async session({session, token, user}) {
      session.user.id = token.id;
      return session;
    },
  },
});
