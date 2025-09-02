const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  subjectToken: { type: String, required: true },
  testAddress: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: "Email", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
