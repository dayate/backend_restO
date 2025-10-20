import { hash, genSalt } from 'bcrypt';

// Fungsi untuk menghash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // Jumlah putaran salt, nilai default yang aman
  const salt = await genSalt(saltRounds);
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};

// Fungsi untuk memvalidasi password terhadap hash
export { compare } from 'bcrypt';