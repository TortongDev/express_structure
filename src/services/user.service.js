import prisma from '../lib/prisma.js';
import z from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(20),
    firstname: z.string().max(50).optional(),
    lastname: z.string().max(50).optional(),
    password: z.string().min(6),
});
export const postUserService = async (email, username, firstname, lastname, password) => {
    try {
        const parsedData = userSchema.parse({ email, username, firstname, lastname, password });
        const user = await prisma.user.create({
            data: {
                email: parsedData.email,
                username: parsedData.username,
                firstname: parsedData.firstname,
                lastname: parsedData.lastname,
                password: parsedData.password,
            },
        });
        return user;
    } catch (err) {
        if (err instanceof z.ZodError) {
            throw new Error(JSON.stringify(err.errors));
        }
        throw err;
    }
}