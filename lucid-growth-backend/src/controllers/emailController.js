const Email = require("../models/Email");
const getImapConnection = require("../config/imap");
const detectESP = require("../utils/espDetector");
const TestSession = require("../models/TestSession");

// Fetch a matching email by subject on-demand (useful for manual testing)
exports.fetchLatestEmail = async (req, res) => {
  const subjectToFind = req.query.subject;
  if (!subjectToFind) return res.status(400).json({ message: "subject query param required" });

  let connection;
  try {
    connection = await getImapConnection();
    await connection.openBox("INBOX");

    const searchCriteria = [["HEADER", "SUBJECT", subjectToFind]];
    const fetchOptions = { bodies: ["HEADER"], markSeen: false };

    const results = await connection.search(searchCriteria, fetchOptions);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No email found with that subject" });
    }

    const mail = results[0];
    const headers = mail.parts[0].body;

    const subject = Array.isArray(headers.subject) ? headers.subject[0] : headers.subject;
    const from = Array.isArray(headers.from) ? headers.from[0] : headers.from;
    const receivingChainRaw = headers.received || [];
    const receivingChain = Array.isArray(receivingChainRaw) ? receivingChainRaw : (receivingChainRaw ? [receivingChainRaw] : []);

    const esp = detectESP(JSON.stringify(headers));

    const saved = await Email.create({
      subject,
      from,
      receivingChain,
      esp,
      rawHeaders: JSON.stringify(headers),
      receivedAt: new Date()
    });

    // Attempt to link to pending test session if subject token found
    const pendingSessions = await TestSession.find({ status: "pending" }).sort({ createdAt: -1 });
    for (const sess of pendingSessions) {
      if (subject && sess.subjectToken && subject.includes(sess.subjectToken)) {
        sess.status = "received";
        sess.emailId = saved._id;
        await sess.save();
        break;
      }
    }

    res.json(saved);
  } catch (err) {
    console.error("fetchLatestEmail error:", err);
    res.status(500).json({ message: "Error fetching email", error: err.message });
  } finally {
    // close connection used for manual fetch
    if (connection && connection.end) {
      try { await connection.end(); } catch (e) { /* ignore */ }
    }
  }
};

// Return all stored emails
exports.getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ receivedAt: -1 });
    res.json(emails);
  } catch (err) {
    console.error("getAllEmails error:", err);
    res.status(500).json({ message: "Error fetching emails", error: err.message });
  }
};

// Return one email by id
exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.json(email);
  } catch (err) {
    console.error("getEmailById error:", err);
    res.status(500).json({ message: "Error fetching email", error: err.message });
  }
};
