import crypto from "crypto";
import bcryptjs from "bcryptjs";

export function generateOtp(): string {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcryptjs.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(otp, hash);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashToken(token: string): Promise<string> {
  return bcryptjs.hash(token, 10);
}

export async function verifyToken(
  token: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(token, hash);
}
