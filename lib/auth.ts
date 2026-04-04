import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { loginSchema } from "@/utils/validate";

const providers: NextAuthOptions["providers"] = [
	Credentials({
		name: "Credentials",
		credentials: {
			email: { label: "Email", type: "email" },
			password: { label: "Password", type: "password" },
		},
		async authorize(credentials) {
			const parsed = loginSchema.safeParse(credentials);
			if (!parsed.success) {
				return null;
			}

			await connectToDatabase();
			const user = await UserModel.findOne({
				email: parsed.data.email.toLowerCase().trim(),
			}).lean();
			if (!user) {
				return null;
			}

			const isValidPassword = await compare(parsed.data.password, user.passwordHash);
			if (!isValidPassword) {
				return null;
			}

			return {
				id: user._id.toString(),
				name: user.name,
				email: user.email,
			};
		},
	}),
	...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		? [
				Google({
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					allowDangerousEmailAccountLinking: true,
				}),
			]
		: []),
];

export const authOptions: NextAuthOptions = {
	providers,
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async signIn({ user, account }) {
			// For Google OAuth users, create or fetch the MongoDB user document
			if (account?.provider === "google") {
				if (!user.email) {
					console.error("[auth/signIn/google] No email from Google provider");
					return false;
				}

				const normalizedEmail = user.email.toLowerCase().trim();

				await connectToDatabase();

				const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
				if (existingUser) {
					// Update user's name if it changed
					user.id = existingUser._id.toString();
					if (existingUser.name !== user.name) {
						await UserModel.updateOne(
							{ _id: existingUser._id },
							{ $set: { name: user.name || "User" } }
						);
					}
					return true;
				}

				// Create new user for Google OAuth
				try {
					const newUser = await UserModel.create({
						name: user.name || "User",
						email: normalizedEmail,
						passwordHash: "", // Google users don't have passwords
						timezone: "Asia/Karachi",
						hasCompletedOnboarding: false,
					});
					const createdUser = newUser.toObject();
					user.id = (createdUser as { _id: { toString(): string } })._id.toString();
					return true;
				} catch (createError) {
					// Handle duplicate key error (race condition)
					if (
						createError instanceof Error &&
						"code" in createError &&
						(createError as { code: number }).code === 11000
					) {
						// Race condition — user was created between our check and insert
						const retryUser = await UserModel.findOne({
							email: normalizedEmail,
						}).lean();
						if (retryUser) {
							user.id = retryUser._id.toString();
							return true;
						}
					}
					console.error(
						"[auth/signIn/google]",
						createError instanceof Error ? createError.message : String(createError)
					);
					return false;
				}
			}

			// For other providers, user.id should already be set by the authorize callback
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id as string;
			}

			return session;
		},
	},
};

export function auth() {
	return getServerSession(authOptions);
}