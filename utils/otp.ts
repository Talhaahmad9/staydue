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

export function hashTokenSHA256(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
