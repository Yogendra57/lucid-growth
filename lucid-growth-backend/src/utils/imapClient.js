const Imap = require("imap");
const { simpleParser } = require("mailparser");

const imapConfig = {
user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  authTimeout: 3000,
  // force PLAIN login
  auth: "PLAIN"
};

function fetchLatestEmail(subjectToken) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    function openInbox(cb) {
      imap.openBox("INBOX", true, cb);
    }

    imap.once("ready", () => {
      console.log("✅ IMAP connected");
      openInbox((err, box) => {
        if (err) {
          console.error("❌ Error opening inbox:", err);
          return reject(err);
        }
        console.log(`📥 Inbox opened: ${box.messages.total} messages`);

        // Search for messages containing subjectToken
        imap.search([["TEXT", subjectToken]], (err, results) => {
          if (err) {
            console.error("❌ Search error:", err);
            imap.end();
            return reject(err);
          }

          console.log("🔎 Search results:", results);

          if (!results || !results.length) {
            console.log("⚠️ No emails found with token:", subjectToken);
            imap.end();
            return resolve(null);
          }

          // Get the latest mail
          const latest = results[results.length - 1];
          console.log("📌 Fetching message ID:", latest);

          const f = imap.fetch(latest, { bodies: "" });

          f.on("message", (msg) => {
            msg.on("body", async (stream) => {
              try {
                const parsed = await simpleParser(stream);

                console.log("✅ Email parsed:", {
                  subject: parsed.subject,
                  from: parsed.from?.text,
                  date: parsed.date,
                });

                const receivingChain = parsed.headerLines
                  .filter((h) => h.key.toLowerCase() === "received")
                  .map((h) => h.line);

                const fromAddress = parsed.from?.value[0]?.address || "";
                const esp = fromAddress.split("@")[1] || "";

                resolve({
                  from: fromAddress,
                  subject: parsed.subject,
                  receivedAt: parsed.date,
                  receivingChain,
                  esp,
                });
              } catch (e) {
                console.error("❌ Error parsing email:", e);
                reject(e);
              }
            });
          });

          f.once("error", (err) => {
            console.error("❌ Fetch error:", err);
            reject(err);
          });

          f.once("end", () => {
            console.log("📨 Done fetching message");
            imap.end();
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("❌ IMAP error:", err);
      reject(err);
    });

    imap.connect();
  });
}
module.exports = { fetchLatestEmail };
