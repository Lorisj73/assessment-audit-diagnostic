import bcrypt from "bcrypt";
import userRepository from "../repositories/UserRepository";

export class AuthService {
  async login(email: string, password: string): Promise<{ user: any } | null> {
    console.log(`Login attempt for ${email}`);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = await userRepository.findByEmail(email);

    if (!user) {
      console.log("User not found");
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("Invalid password");
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }

  async verifyToken(token: string): Promise<number | null> {
    try {
      const userId = parseInt(token, 10);
      const user = await userRepository.findById(userId);
      return user ? user.id : null;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }
}

export default new AuthService();
