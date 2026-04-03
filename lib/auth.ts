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
			const user = await UserModel.findOne({ email: parsed.data.email }).lean();
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
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id;
			}

			return session;
		},
	},
};

export function auth() {
	return getServerSession(authOptions);
}