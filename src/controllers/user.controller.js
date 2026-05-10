import { Prisma } from '../generated/index.js';
import { ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { post_register } from '../services/register.servie.js';
import { list_packages } from '../services/package.service.js';
import { postUserService } from '../services/user.service.js';
export const showUser = async (req, res) => {
  const user = req.user; 
  const package_list = await list_packages();
  console.log(package_list);
  return res.render('users/index', { error: null, user, package_list });
};

const EMPTY_OLD = { email: '', username: '', firstname: '', lastname: '' };

export const showRegister = (req, res) => {
    return res.render('register/index', { error: null, old: EMPTY_OLD, layout: true });
};

export const register = async (req, res) => {
    try {
        const { email, username, firstname, lastname, password, role } = req.body;

        if (!email || !username || !password) {
            return res.render('register/index', {
                error: 'email, username and password are required',
                old: { email, username, firstname, lastname },
                layout: false,
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await post_register(email, username, firstname, lastname, password_hash, role);

        return res.redirect('/auth/login?locale=en');
    } catch (err) {
        if (err.code === 'P2002') {
            const fields = err.meta?.target ?? [];
            const fieldLabel = fields.includes('email') ? 'email' : fields.join(', ');
            const friendlyMsg = fieldLabel
                ? `${fieldLabel} นี้ถูกใช้งานแล้ว กรุณาใช้ข้อมูลอื่น`
                : 'ข้อมูลนี้ถูกใช้งานแล้ว กรุณาใช้ข้อมูลอื่น';

            return res.render('register/index', {
                error: friendlyMsg,
                old: { email: req.body.email, username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname },
                layout: false,
            });
        }

        const obj = JSON.parse(err.message);
        const message_error = (obj[0].path ? obj[0].path + " " : "") + obj[0].message;
        console.log("message_error", message_error);
        return res.render('register/index', {
            error: message_error,
            old: { email: req.body.email, username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname },
            layout: false,
        });
    }
};

export const postUser = async (req, res) => {
    try {
        const {  email, username, firstname, lastname, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'email, username and password are required' });
        }

        const user = await postUserService(email, username, firstname, lastname, password);
        return res.status(201).json(user);
    } catch (err) {
        if (err instanceof z.ZodError) {
            const obj = JSON.parse(err.message);
            const message_error = (obj[0].path ? obj[0].path + " " : "") + obj[0].message;
            return res.status(400).json({ error: message_error });
        }
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};