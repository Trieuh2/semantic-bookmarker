import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid Credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const bcrypt = require("bcrypt");
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const sessionRecord = await prisma.session.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          expires: "desc",
        },
      });

      if (sessionRecord) {
        session.sessionToken = sessionRecord.sessionToken;
        session.userId = sessionRecord.userId;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (user.email) {
        let userInDb = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        // Create a new user with default "Unsorted" collection
        if (!userInDb) {
          userInDb = await createUserWithEmail(user.email);
          return true;
        }

        // Ensure that the user has default "Unsorted" collection created
        await ensureDefaultCollectionCreated(user.id);
        return true;
      }
      return false;
    },
  },
  adapter: PrismaAdapter(prisma),
  debug: false,
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Custom function to create user
async function createUserWithEmail(email: string) {
  // Logic to create user and default collection
  const userData = await prisma.user.create({
    data: {
      email,
      collections: {
        create: {
          name: "Unsorted",
          isDefault: true,
        },
      },
    },
    include: {
      collections: true,
    },
  });

  return userData;
}

async function ensureDefaultCollectionCreated(userId: string) {
  const existingDefaultCollection = await prisma.collection.findFirst({
    where: {
      userId,
      name: "Unsorted",
    },
  });

  if (existingDefaultCollection) {
    await setDefaultCollection(userId, existingDefaultCollection.id);
    await setBookmarksDefaultCollection(userId, existingDefaultCollection.id);
  } else {
    const newDefaultCollection = await prisma.collection.create({
      data: {
        userId,
        name: "Unsorted",
        isDefault: true,
      },
    });
    await setDefaultCollection(userId, newDefaultCollection.id);
    await setBookmarksDefaultCollection(userId, newDefaultCollection.id);
  }
}

async function setDefaultCollection(
  userId: string,
  defaultCollectionId: string
) {
  // Reset any defaults
  await prisma.collection.updateMany({
    where: {
      userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  // Set the new default
  return prisma.collection.update({
    where: {
      id: defaultCollectionId,
    },
    data: {
      isDefault: true,
    },
  });
}

async function setBookmarksDefaultCollection(
  userId: string,
  defaultCollectionId: string
) {
  const bookmarks = await prisma.bookmark.updateMany({
    where: {
      userId,
      collectionId: null,
    },
    data: {
      collectionId: defaultCollectionId,
    },
  });

  return bookmarks;
}
