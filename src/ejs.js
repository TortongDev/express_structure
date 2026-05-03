import express     from 'express';
import cookieParser from 'cookie-parser';
import authRoute    from './routes/auth.ejs.route.js';
import requireSession from './middlewares/requireSession.js';
import packageRoute from './routes/package.ejs.route.js';
const EJS_APP = express();

EJS_APP.set('view engine', 'ejs');
EJS_APP.set('views', './src/views');
EJS_APP.use(express.urlencoded({ extended: true }));
EJS_APP.use(cookieParser());

// ── Auth routes (public — no session required) ────────────────────────────────
EJS_APP.use('/auth', authRoute);
EJS_APP.use('/package', packageRoute);

// ── Protected routes (session required) ──────────────────────────────────────
EJS_APP.get('/', requireSession, (req, res) => res.redirect('/dashboard'));

EJS_APP.get('/dashboard', requireSession, (req, res) => {
  res.render('dashboard/index', { user: req.user });
});

// Add your protected routes here:
// EJS_APP.use('/stock',    requireSession, stockRoute);
// EJS_APP.use('/sales',    requireSession, salesRoute);
// EJS_APP.use('/admin',    requireSession, requireRole('ADMIN'), adminRoute);

export default EJS_APP;
