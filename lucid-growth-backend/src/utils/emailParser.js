// utils/emailParser.js

function extractReceivingChain(headers) {
  const receivedHeaders = headers["received"];
  if (!receivedHeaders) return [];

  const entries = Array.isArray(receivedHeaders) ? receivedHeaders : [receivedHeaders];
  return entries.map(line => line.trim());
}

function detectESP(headers) {
  const headerStr = JSON.stringify(headers).toLowerCase();

  if (headerStr.includes("gmail.com") || headerStr.includes("google.com")) return "Gmail";
  if (headerStr.includes("outlook.com") || headerStr.includes("office365.com")) return "Outlook / Office365";
  if (headerStr.includes("amazonses.com") || headerStr.includes("ses-smtp")) return "Amazon SES";
  if (headerStr.includes("zoho.com") || headerStr.includes("zohomail")) return "Zoho Mail";
  if (headerStr.includes("yahoo.com") || headerStr.includes("yahoomail")) return "Yahoo Mail";

  return "Unknown ESP";
}

function processEmail(parsedEmail) {
  return {
    subject: parsedEmail.subject || "",
    from: parsedEmail.from?.text || "",
    date: parsedEmail.date || new Date(),
    receivingChain: extractReceivingChain(parsedEmail.headers),
    esp: detectESP(parsedEmail.headers),
  };
}

module.exports = { processEmail };
