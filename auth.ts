import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  accounts,
  authenticators,
  sessions,
  userCredentialsTable,
  usersTable,
  verificationTokens
} from "@/db/schema";
const saltRounds = 10;
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { CrmRolesEnum } from "@/models";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      /** The user's postal address. */
      role?: CrmRolesEnum;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

const drizzleAdapter = DrizzleAdapter(db, {
  usersTable: usersTable,
  accountsTable: accounts,
  // authenticatorsTable: authenticators,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens
});

export const {
  handlers,
  signIn: signInFn,
  signOut: signOutFn,
  auth
} = NextAuth({
  adapter: drizzleAdapter,
  providers: [
    // Credentials({
    //   // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   authorize: async (credentials) => {
    //     console.log("credentials", credentials);
    //     console.log("email", credentials.email);
    //     console.log("password", credentials.password);
    //     let user = { email: (credentials.email as string) || "hello" };
    //     // const hash = await bcrypt.hash(credentials.password as string, saltRounds);
    //     // console.log("hash", hash);
    //     const result = await bcrypt.compare(
    //       credentials.password as string, // plain text password
    //       "$2b$10$0Vho/0Z7ldec0dJY7Nte4.VKbqV0mEsM6.vfOo3jET8mUIyqPXT1i"
    //     );
    //     console.log("result", result);
    //     // logic to salt and hash password
    //     // const pwHash = saltAndHashPassword(credentials.password);
    //     // logic to verify if the user exists
    //     // user = await getUserFromDb(credentials.email, pwHash);
    //     if (!user) {
    //       // No user found, so this is their first attempt to login
    //       // meaning this is also the place you could do registration
    //       throw new Error("User not found.");
    //     }
    //     // return user object with their profile data
    //     return user;
    //   }
    // })
    // GitHub,
    Google
    // Credentials({
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   authorize: async (credentials) => {
    //     // 1. Fetch the user by email from the database
    //     if (!credentials.email && !credentials.password) {
    //       throw new Error("Invalid email or password.");
    //     }

    //     // const result = await bcrypt.hash(
    //     //   credentials.password as string,
    //     //   saltRounds
    //     // );

    //     // console.log("result", result);

    //     // return {};

    //     const user = await db
    //       .select({
    //         id: usersTable.id,
    //         email: usersTable.email,
    //         name: usersTable.name,
    //         phone: usersTable.phone,
    //         hashedPassword: userCredentialsTable.hashedPassword
    //       })
    //       .from(usersTable)
    //       .leftJoin(
    //         userCredentialsTable,
    //         eq(usersTable.id, userCredentialsTable.userId)
    //         // usersTable.id.equals(userCredentialsTable.userId)
    //       )
    //       .where(eq(usersTable.email, credentials.email as string))
    //       // .where(
    //       //   usersTable.email.equals(credentials?.email)

    //       // )
    //       .execute();

    //     if (!user || !user[0]) {
    //       throw new Error("Invalid email or password. - no user");
    //     }

    //     ///
    //     const { hashedPassword } = user[0];

    //     if (!hashedPassword) {
    //       throw new Error("Invalid email or password.");
    //     }

    //     console.log("user", user);

    //     console.log("hasedPassword", hashedPassword);
    //     console.log("typed-password-by-user", credentials.password);

    //     // 2. Validate password with bcrypt
    //     const isValidPassword = await bcrypt.compare(
    //       credentials.password as string,
    //       hashedPassword
    //     );

    //     console.log("isValidPassword", isValidPassword);

    //     if (!isValidPassword) {
    //       throw new Error("Invalid email or password.");
    //     }

    //     // 3. Return user object
    //     return {
    //       id: user[0].id,
    //       email: user[0].email,
    //       name: user[0].name,
    //       phone: user[0].phone
    //     };
    //     // return {
    //     //   id: "4f63548b-c54f-4906-816c-34f193e33d3c",
    //     //   email: "hello",
    //     //   name: "world"
    //     // } as User;
    //   }
    // })
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log("auth", auth);
      console.log("nextUrl", nextUrl);
      const isLoggedIn = !!auth?.user;
      const paths = ["/profile", "/client-side", "/api/session"];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/login", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    jwt: ({ token, user, account, profile, session, trigger }) => {
      console.log("account", account);
      console.log("profile", profile);
      console.log("token", token);
      console.log("user", user);
      console.log("session", session);
      console.log("trigger", trigger);
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey
        };
      }
      return token;
    },
    session({ session, token, user }) {
      // console.log("session-session", session);
      // console.log("session-token", token);
      console.log("session-user", user);
      return session;
    }
  },

  jwt: {
    encode: async function (params) {
      console.log("params-jtw", params);
      if (params.token) {
        const sessionToken = uuidv4();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await drizzleAdapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        console.log(drizzleAdapter?.createSession);

        console.log("createdSession", createdSession);

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        console.log("session-token", sessionToken);

        return sessionToken;
      }
      return defaultEncode(params);
    }
  }
});
