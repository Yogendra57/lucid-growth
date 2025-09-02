const getImapConnection = require("../config/imap");
const { processUnread } = require("./emailProcessor");

async function startImapListener() {
  try {
    const connection = await getImapConnection();
    await connection.openBox("INBOX");
    console.log("📬 IMAP connected and INBOX opened for listening.");

    // Run an initial scan
    try {
      const n = await processUnread(connection);
      console.log(`Initial IMAP scan processed ${n} messages.`);
    } catch (e) {
      console.warn("Initial IMAP scan failed:", e.message || e);
    }

    // Use underlying node-imap to listen for 'mail' events
    const imap = connection.imap;
    imap.on("mail", async (numNew) => {
      console.log(`📨 IMAP 'mail' event: ${numNew} new messages (scanning).`);
      try {
        await processUnread(connection);
      } catch (err) {
        console.error("Error during IMAP 'mail' processing:", err);
      }
    });

    imap.on("error", (err) => {
      console.error("IMAP connection error:", err);
    });

    imap.on("end", () => {
      console.warn("IMAP connection ended.");
    });

    // keep function alive; connection stays open
    return connection;
  } catch (err) {
    console.error("Failed to start IMAP listener:", err);
    throw err;
  }
}

module.exports = startImapListener;
