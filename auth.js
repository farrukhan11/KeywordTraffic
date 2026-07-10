import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function getOrCreateAdmin(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return null;
  if (email !== adminEmail || password !== adminPassword) return null;

  let user = await User.findOne({ email: adminEmail });
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  if (!user) {
    user = await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
  } else {
    user.name = process.env.ADMIN_NAME || user.name || "Admin";
    user.role = "admin";

    const passwordMatches = await bcrypt.compare(adminPassword, user.passwordHash);
    if (!passwordMatches) user.passwordHash = passwordHash;

    await user.save();
  }

  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const password = parsed.data.password;

        await connectDB();

        // Always check configured admin credentials first. This also repairs an
        // existing account that was previously created with another password.
        let user = await getOrCreateAdmin(email, password);

        if (!user) {
          user = await User.findOne({ email });
          if (!user) return null;

          const validPassword = await bcrypt.compare(password, user.passwordHash);
          if (!validPassword) return null;
        }

        return {
          id: user._id.toString(),
          name: user.name || user.email,
          email: user.email,
          role: user.role || "user",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      if (user?.role) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role || "user";
      }
      return session;
    },
  },
});