const TestSession = require("../models/TestSession");

exports.createTestSession = async (req, res) => {
  try {
    const token = "LG-TEST-" + Math.random().toString(16).slice(2, 8).toUpperCase();
    const testAddress = process.env.IMAP_USER;
    const sess = await TestSession.create({ subjectToken: token, testAddress });
    res.json({ sessionId: sess._id, subjectToken: token, testAddress });
  } catch (err) {
    console.error("createTestSession error:", err);
    res.status(500).json({ message: "Failed to create test session", error: err.message });
  }
};

exports.getTestStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const sess = await TestSession.findById(id).populate("emailId");
    if (!sess) return res.status(404).json({ message: "Test session not found" });
    res.json(sess);
  } catch (err) {
    console.error("getTestStatus error:", err);
    res.status(500).json({ message: "Failed to fetch test status", error: err.message });
  }
};
