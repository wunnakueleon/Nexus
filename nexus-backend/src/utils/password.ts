import bcrypt from "bcrypt";

// Cost factor for bcrypt — 10 is a sensible default balancing speed and strength.
const SALT_ROUNDS = 10;

export const hashPassword = (plain: string): Promise<string> =>
	bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
	bcrypt.compare(plain, hash);
