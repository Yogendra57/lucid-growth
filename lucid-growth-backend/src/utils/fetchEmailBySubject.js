const getImapConnection = require("../config/imap");
const detectESP = require("./espDetector");

async function fetchEmailBySubject(subjectToFind) {
  let connection;
  try {
    connection = await getImapConnection();
    await connection.openBox("INBOX");

    const searchCriteria = [["HEADER", "SUBJECT", subjectToFind]];
    const fetchOptions = { bodies: ["HEADER"], markSeen: false };
    const results = await connection.search(searchCriteria, fetchOptions);

    if (!results || results.length === 0) return null;

    const mail = results[0];
    const headers = mail.parts[0].body;

    const subject = Array.isArray(headers.subject) ? headers.subject[0] : headers.subject;
    const from = Array.isArray(headers.from) ? headers.from[0] : headers.from;
    const receivingChainRaw = headers.received || [];
    const receivingChain = Array.isArray(receivingChainRaw)
      ? receivingChainRaw
      : receivingChainRaw ? [receivingChainRaw] : [];
    const esp = detectESP(JSON.stringify(headers));

    return {
      subject,
      from,
      receivingChain,
      esp,
      rawHeaders: JSON.stringify(headers),
      receivedAt: new Date()
    };
  } catch (err) {
    console.error("fetchEmailBySubject error:", err);
    return null;
  } finally {
    if (connection && connection.end) {
      try { await connection.end(); } catch (e) {}
    }
  }
}

module.exports = fetchEmailBySubject;
