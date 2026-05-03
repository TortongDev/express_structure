import express      from 'express';
import internalOnly from './middlewares/internalOnly.js';
import v1Router       from './routes/api/v1/index.js';
import internalRouter from './routes/api/internal/index.js';

const APP_APP = express();
APP_APP.use(express.json());

// ── Public API (external clients, rate-limit, versioned) ─────────────────────
APP_APP.use('/api/v1', v1Router);

// ── Internal API (server-to-server only, blocked by Nginx from public internet)
// Client must send: X-Internal-Secret: <INTERNAL_API_SECRET>
APP_APP.use('/api/internal', internalOnly, internalRouter);

export default APP_APP;
