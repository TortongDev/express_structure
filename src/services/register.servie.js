import prisma from '../lib/prisma.js';
import z from 'zod';
import bcrypt from "bcryptjs";
//   id            String   @id @default(uuid())
//   email         String   @unique
//   username      String   @unique
//   firstname     String
//   lastname      String
//   password_hash String
//   role          Role     @default(STAFF)
//   created_at    DateTime @default(now())
//   updated_at    DateTime @updatedAt
const register_schema = z.object({
  email:        z.string().min(1).max(100),
  username: z.string().min(3).max(100),
  firstname: z.string().max(100).optional(),
  lastname: z.string().max(100).optional(),
  password_hash: z.string().max(500).optional(),
  role: z.string().optional()
});

export const post_register = async (email, username, firstname, lastname, password_hash, role)  =>  {
    const data = register_schema.parse({ email, username, firstname, lastname, password_hash, role });
    const user = await prisma.user.create({ data });
    return user;
}