import prisma from '../lib/prisma.js';
import z from 'zod';
import bcrypt from "bcryptjs";

const register_schema = z.object({
  email:     z.string().min(8).max(100),
  username: z.string().min(8).max(100),
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