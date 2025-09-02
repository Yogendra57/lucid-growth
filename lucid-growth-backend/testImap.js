const Imap = require('imap');
require('dotenv').config();

const imap = new Imap({
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASS.replace(/\s+/g, ''), // remove spaces just in case
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  authTimeout: 10000,
  authMethod: 'PLAIN'   // 👈 force PLAIN auth for Gmail
});

imap.once('ready', () => {
  console.log('✅ IMAP Connection Successful!');
  imap.end();
});

imap.once('error', (err) => {
  console.error('❌ IMAP Connection Error:', err);
});

imap.connect();
