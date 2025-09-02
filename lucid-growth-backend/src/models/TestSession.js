const mongoose = require("mongoose");

const testSessionSchema = new mongoose.Schema({
  subjectToken: { type: String, required: true, unique: true },
  testAddress: { type: String, required: true },
  status: { type: String, enum: ["pending", "received", "expired"], default: "pending" },
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: "Email", default: null }
}, { timestamps: true });

module.exports = mongoose.model("TestSession", testSessionSchema);
