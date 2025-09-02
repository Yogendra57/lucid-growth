const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  subject: String,
  from: String,
  receivingChain: [String],
  esp: String,
  rawHeaders: String,
  receivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", emailSchema);
