import "dotenv/config";

import EJS_APP from "./ejs.js";
const EJS_PORT = process.env["EJS_PORT"];

import APP_APP from "./app.js";
const APP_POST = process.env["APP_PORT"];


APP_APP.listen(APP_POST, () => {
  console.log(`App is running on port ${process.env["APP_PORT"]}`);
});
EJS_APP.listen(EJS_PORT, () => {
  console.log(`EJS App is running on port ${EJS_PORT}`);
});