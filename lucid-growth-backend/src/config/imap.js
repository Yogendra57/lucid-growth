const imaps = require("imap-simple");
require("dotenv").config();

const getImapConnection = async () => {
  const password = process.env.IMAP_PASSWORD || process.env.IMAP_PASS;
  if (!process.env.IMAP_USER || !password) {
    throw new Error("Missing IMAP_USER or IMAP_PASSWORD/IMAP_PASS env variable");
  }

  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: password,
      host: process.env.IMAP_HOST || "imap.gmail.com",
      port: Number(process.env.IMAP_PORT || 993),
      tls: process.env.IMAP_TLS ? process.env.IMAP_TLS === "true" : true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }, // local testing only
    },
  };

  const connection = await imaps.connect(config);

  connection.on("error", (err) => {
    console.error("IMAP connection error:", err);
    // optionally reconnect here
  });

  connection.on("end", () => {
    console.log("IMAP connection ended.");
    // optionally reconnect here
  });

  return connection;
};

module.exports = getImapConnection;
