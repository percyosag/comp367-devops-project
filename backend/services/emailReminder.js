const nodemailer = require("nodemailer");

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return _transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log("[Email] Test account auto-created:", testAccount.user);
  console.log("[Email] View all sent emails at: https://ethereal.email");

  _transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  return _transporter;
}

async function sendReminderEmail({ toEmail, toName, eventTitle, eventDate, eventTime, eventLocation }) {
  const transporter = await getTransporter();

  const formattedDate = new Date(eventDate).toLocaleDateString("en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const info = await transporter.sendMail({
    from: '"Event Platform" <no-reply@eventplatform.com>',
    to: toEmail,
    subject: `Reminder: "${eventTitle}" is tomorrow!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px;">
        <h2 style="color: #1a1a2e;">Event Reminder</h2>
        <p>Hi ${toName},</p>
        <p>This is a friendly reminder that you are registered for <strong>${eventTitle}</strong>, happening tomorrow.</p>
        <ul style="line-height: 2;">
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${eventTime}</li>
          <li><strong>Location:</strong> ${eventLocation}</li>
        </ul>
        <p>We look forward to seeing you there!</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Community Event Platform</p>
      </div>
    `,
  });


  console.log("[Email] Preview URL:", nodemailer.getTestMessageUrl(info));
}

module.exports = { sendReminderEmail };
