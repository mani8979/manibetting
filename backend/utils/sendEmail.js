const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use console logger fallback if SMTP_HOST is not provided
  if (!process.env.SMTP_HOST) {
    console.log('--- EMAIL FALLBACK (no SMTP configured) ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('-------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    tls: {
      rejectUnauthorized: false // needed for some Gmail configs
    }
  });

  const mailOptions = {
    from: `PlayZone <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,   // plain text fallback
    html: options.html || undefined  // HTML version (optional)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email sent]', info.messageId, '→', options.email);
  } catch (error) {
    console.error('[Email error]', error.message);
    throw error; // re-throw so callers can handle it
  }
};

module.exports = sendEmail;
