import bcrypt from 'bcryptjs';
import { response } from '../lib/response.js';
import { post_register } from '../services/register.servie.js';

export const register = async (req, res) => {
    try {
        const { email, username, firstname, lastname, password, role } = req.body;

        if (!email || !username || !password) {
            return response.error(res, 'email, username and password are required');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await post_register(email, username, firstname, lastname, password_hash, role);

        return response.created_success(res, { id: user.id, email: user.email, username: user.username }, 'Registered successfully');
    } catch (err) {
        if (err.code === 'P2002') {
            return response.error(res, 'Email or username already exists');
        }
        console.error(err);
        return response.serverError(res);
    }
};