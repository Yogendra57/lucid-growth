const Session = require("../models/Session");
const crypto = require("crypto");
const Email = require("../models/Email");
const { fetchLatestEmail } = require("../utils/imapClient");

// Create a new test session
const createSession = async (req, res) => {
  try {
    const { testAddress } = req.body;

    if (!testAddress) {
      return res.status(400).json({ message: "Test address is required" });
    }

    const subjectToken =
      "LG-TEST-" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const newSession = new Session({
      subjectToken,
      testAddress,
      status: "pending",
    });

    await newSession.save();

    res.status(201).json(newSession);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating session", error: error.message });
  }
};

// Fetch session and attach email data if available
const fetchSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    let session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Case 1: Email not yet linked → fetch from IMAP
    if (!session.emailId) {
      try {
        const emailData = await fetchLatestEmail(session.subjectToken);

        if (emailData) {
          // Save email in collection
          const savedEmail = await Email.create({
            subject: emailData.subject,
            from: emailData.from,
            receivedAt: emailData.receivedAt,
            receivingChain: emailData.receivingChain,
            esp: emailData.esp,
            rawHeaders: emailData.rawHeaders || "",
          });

          // Update session
          session.emailId = savedEmail._id;
          session.status = "completed";
          await session.save();

          return res.json({
            ...session.toObject(),
            email: savedEmail, // attach full email doc
          });
        }
      } catch (err) {
        console.error("IMAP fetch error:", err.message);
      }
    }

    // Case 2: Already linked → populate email
    if (session.emailId) {
      const emailDoc = await Email.findById(session.emailId);
      return res.json({
        ...session.toObject(),
        email: emailDoc || null,
      });
    }

    // Case 3: Still pending
    res.json({
      ...session.toObject(),
      email: null,
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    res
      .status(500)
      .json({ message: "Error fetching session", error: error.message });
  }
};

module.exports = { createSession, fetchSession };
