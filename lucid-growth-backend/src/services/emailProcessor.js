const Email = require("../models/Email");
const TestSession = require("../models/TestSession");
const detectESP = require("../utils/espDetector");

async function processUnread(connection) {
  try {
    
    try { await connection.openBox("INBOX"); } catch (e) { /* ignore if already open */ }

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = {
      bodies: ["HEADER"],
      markSeen: true, 
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    if (!messages || messages.length === 0) return 0;

    let processed = 0;
    for (const item of messages) {
      try {
        const headerPart = item.parts.find((p) => p.which === "HEADER");
        const headers = headerPart ? headerPart.body : {};

        const subject = Array.isArray(headers.subject) ? headers.subject[0] : (headers.subject || "(no subject)");
        const from = Array.isArray(headers.from) ? headers.from[0] : (headers.from || "Unknown");
        const receivingChainRaw = headers.received || [];
        const receivingChain = Array.isArray(receivingChainRaw)
          ? receivingChainRaw
          : (receivingChainRaw ? [receivingChainRaw] : []);

        const esp = detectESP(JSON.stringify(headers));

        // Save email (store raw headers as string for now)
        const newEmail = await Email.create({
          subject,
          from,
          receivingChain,
          esp,
          rawHeaders: JSON.stringify(headers),
          receivedAt: new Date()
        });

        // Link to pending test session if token present in subject
        const pendingSessions = await TestSession.find({ status: "pending" }).sort({ createdAt: -1 });
        for (const sess of pendingSessions) {
          if (subject && sess.subjectToken && subject.includes(sess.subjectToken)) {
            sess.status = "received";
            sess.emailId = newEmail._id;
            await sess.save();
            console.log(`🔗 Linked email "${subject}" to test session ${sess.subjectToken}`);
            break; 
          }
        }

        processed++;
      } catch (innerErr) {
        console.error("Error processing message:", innerErr);
        continue;
      }
    }

    return processed;
  } catch (err) {
    console.error("processUnread error:", err);
    throw err;
  }
}

module.exports = { processUnread };
