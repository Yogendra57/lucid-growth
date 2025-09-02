// utils/espDetector.js

// Detect ESP (Email Service Provider) from headers
function detectESP(headers) {
  const headerStr = headers.toLowerCase();

  // Gmail / Google Workspace
  if (/gmail\.com|google\.com/.test(headerStr)) {
    return "Gmail / Google Workspace";
  }

  // Outlook / Hotmail / Office 365
  if (/outlook\.com|hotmail\.com|live\.com|microsoft\.com|office365\.com/.test(headerStr)) {
    return "Outlook / Office 365";
  }

  // Yahoo
  if (/yahoo\.com|ymail\.com/.test(headerStr)) {
    return "Yahoo Mail";
  }

  // Apple iCloud
  if (/icloud\.com|apple\.com|me\.com/.test(headerStr)) {
    return "iCloud Mail";
  }

  // ProtonMail
  if (/protonmail\.com/.test(headerStr)) {
    return "ProtonMail";
  }

  // Yandex
  if (/yandex\.com|yandex\.ru/.test(headerStr)) {
    return "Yandex Mail";
  }

  // Amazon SES
  if (/amazonses\.com/.test(headerStr)) {
    return "Amazon SES";
  }

  // SendGrid
  if (/sendgrid\.net/.test(headerStr)) {
    return "SendGrid";
  }

  // Mailgun
  if (/mailgun\.org/.test(headerStr)) {
    return "Mailgun";
  }

  // Zoho
  if (/zoho\.com/.test(headerStr)) {
    return "Zoho Mail";
  }

  // Fastmail
  if (/fastmail\.com/.test(headerStr)) {
    return "Fastmail";
  }

  // GMX / Mail.com
  if (/gmx\.com|mail\.com/.test(headerStr)) {
    return "GMX / Mail.com";
  }

  // Fallback
  console.warn("⚠️ ESP not detected. Headers snippet:", headerStr.slice(0, 200));
  return "Unknown";
}

module.exports = detectESP;
