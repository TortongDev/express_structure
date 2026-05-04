import "dotenv/config";

import EJS_APP from "./ejs.js";
const EJS_PORT = process.env["EJS_PORT"];

import APP_APP from "./app.js";
const APP_POST = process.env["APP_PORT"];

// ── Session-based EJS app (Redis session, rolling TTL) ────────────────────────
import EJS_SESSION_APP from "./ejs-app.js";
const EJS_SESSION_PORT = process.env["EJS_SESSION_PORT"];


APP_APP.listen(APP_POST, () => {
  console.log(`App is running on port ${process.env["APP_PORT"]}`);
});
// EJS_APP.listen(EJS_PORT, () => {   // backup: JWT cookie-based
//   console.log(`EJS App is running on port ${EJS_PORT}`);
// });
EJS_SESSION_APP.listen(EJS_PORT, () => {
  console.log(`EJS Session App is running on port ${EJS_PORT}`);
});