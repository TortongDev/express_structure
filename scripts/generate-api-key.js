/**
 * Generate a new API key and print the values needed to insert into DB.
 *
 * Usage:
 *   node scripts/generate-api-key.js
 *   node scripts/generate-api-key.js test    ← generates cafei_test_ key
 *
 * Copy the output and insert via backoffice or direct DB query.
 * Store only the HASH in DB — give the RAW KEY to the third-party.
 */

import crypto from 'crypto';

const env    = process.argv[2] === 'test' ? 'test' : 'live';
const raw    = `cafei_${env}_${crypto.randomBytes(16).toString('hex')}`;
const hash   = crypto.createHash('sha256').update(raw).digest('hex');
const prefix = raw.slice(0, 20);

console.log('\n── API Key Generated ──────────────────────────────────');
console.log(`RAW KEY  (give to client) : ${raw}`);
console.log(`PREFIX   (store in DB)    : ${prefix}`);
console.log(`HASH     (store in DB)    : ${hash}`);
console.log('────────────────────────────────────────────────────\n');
console.log('SQL insert example:');
console.log(`INSERT INTO api_keys (id, key, key_prefix, name, created_by)`);
console.log(`VALUES (gen_random_uuid(), '${hash}', '${prefix}', 'ชื่อระบบ', 'admin-user-id');\n`);
