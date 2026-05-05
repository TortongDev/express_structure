import bcrypt from 'bcryptjs';
import { response } from '../lib/response.js';
import { post_register } from '../services/register.servie.js';
import { ZodError } from 'zod';

const EMPTY_OLD = { email: '', username: '', firstname: '', lastname: '' };

export const showRegister = (req, res) => {
    return res.render('register/index', { error: null, old: EMPTY_OLD, layout: false });
};

export const register = async (req, res) => {
    try {
        const { email, username, firstname, lastname, password, role } = req.body;

        if (!email || !username || !password) {
            return res.render('register/index', {
                error: 'email, username and password are required',
                old: { email, username, firstname, lastname },
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await post_register(email, username, firstname, lastname, password_hash, role);

        return res.redirect('/auth/login?locale=en');
    } catch (err) {
        if (err.code === 'P2002') {
            console.log("error code ", err.message);
            
            return res.render('register/index', {
                error: err.message,
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