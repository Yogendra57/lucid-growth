const getImapConnection = require("./config/imap");
const Email = require("./models/Email");
const Session = require("./models/Session");
const detectESP = require("./utils/espDetector");

const startEmailListener = async () => {
  try {
    const connection = await getImapConnection();
    await connection.openBox("INBOX");

    console.log("📬 IMAP connected and INBOX opened for listening.");

    // Initial scan
    const messages = await connection.search(["UNSEEN"], { bodies: ["HEADER"] });
    console.log(`Initial IMAP scan processed ${messages.length} messages.`);

    // Listen for new messages
    connection.on("mail", async (numNewMsgs) => {
      console.log(`📨 IMAP 'mail' event: ${numNewMsgs} new messages (scanning).`);

      try {
        const results = await connection.search(["UNSEEN"], { bodies: ["HEADER"], markSeen: true });
        
        for (const mail of results) {
          const headers = mail.parts[0].body;

          const receivingChain = headers["received"] || [];
          const esp = detectESP(JSON.stringify(headers));

          // Save email
          const newEmail = new Email({
            subject: headers.subject ? headers.subject[0] : "No Subject",
            from: headers.from ? headers.from[0] : "Unknown",
            receivingChain: Array.isArray(receivingChain) ? receivingChain : [receivingChain],
            esp,
            rawHeaders: JSON.stringify(headers),
          });

          await newEmail.save();
          console.log("✅ New email saved:", newEmail.subject);

          // Update session if exists
          const session = await Session.findOne({ subjectToken: headers.subject[0], status: "pending" });
          if (session) {
            session.status = "completed";
            session.emailId = newEmail._id;
            await session.save();
            console.log(`✅ Session ${session._id} updated with email.`);
          }
        }
      } catch (err) {
        console.error("Error processing new emails:", err);
      }
    });

    connection.on("error", (err) => console.error("IMAP connection error:", err));
    connection.on("end", () => console.log("IMAP connection ended."));
    
  } catch (err) {
    console.error("Failed to start IMAP listener:", err);
  }
};

module.exports = startEmailListener;
