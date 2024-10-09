import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "./lib/db";

export const {handlers, signIn, signOut, auth} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const {email, password} = credentials;
        const user = await prisma.user.findUnique({where: {email}});
        console.log(user);
        if (user) {
          const validPassword = bcryptjs.compare(password, user.password);
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
    // async signIn({user, account, profile}) {
    //   return true;
    // },
    async jwt({token, user, session}) {
      return token;
    },
    async session({session, token, user}) {
      session.user.id = token.sub;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
