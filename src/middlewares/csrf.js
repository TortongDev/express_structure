import crypto from 'crypto';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfMiddleware = (req, res, next) => {
    // Generate token once per session
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Expose to all EJS views via res.locals
    res.locals.csrfToken = req.session.csrfToken;

    // Validate on state-changing requests
    if (!SAFE_METHODS.has(req.method)) {
        const token = req.body?._csrf || req.headers['x-csrf-token'];
        if (!token || token !== req.session.csrfToken) {
            return res.status(403).send('Invalid CSRF token');
        }
    }

    next();
};
