const getImapConnection = require("./src/config/imap");

const { simpleParser } = require("mailparser");

(async () => {
  let connection;
  try {
    connection = await getImapConnection();
    await connection.openBox("INBOX");

    const subjectToFind = "LG-TEST-832715"; // replace with your subject token
    const searchCriteria = [["HEADER", "SUBJECT", subjectToFind]];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };

    const results = await connection.search(searchCriteria, fetchOptions);

    if (!results || results.length === 0) {
      console.log("No emails found with that subject.");
      return;
    }

    const mail = results[0];

    // Parse headers properly
    const headers = mail.parts.find(part => part.which === "HEADER").body;
    const from = headers.from ? headers.from[0] : "Unknown";
    const subject = headers.subject ? headers.subject[0] : "No Subject";
    const date = headers.date ? headers.date[0] : new Date();

    // Parse body
    const textPart = mail.parts.find(p => p.which === "TEXT").body;
    const parsed = await simpleParser(textPart);

    console.log({
      from,
      subject,
      date,
      text: parsed.text,
    });
  } catch (err) {
    console.error("IMAP fetch error:", err);
  } finally {
    if (connection && connection.end) await connection.end();
  }
})();
