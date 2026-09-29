import nodemailer from 'nodemailer';

function isMailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  const rawPass = (process.env.SMTP_PASS || '').trim();
  const pass = rawPass.includes(' ') ? rawPass.replace(/\s+/g, '') : rawPass;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
  });
}

export async function sendContactEmail({ name, email, message }) {
  if (!isMailConfigured()) {
    const err = new Error(
      'Email is not configured on the server. Please set SMTP_USER and SMTP_PASS in environment variables.'
    );
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  const transporter = createTransporter();
  const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
  } catch (error) {
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      const authErr = new Error(
        'Gmail authentication failed. Gmail requires a 16-character App Password, not your standard Gmail password. Generate one at Google Account -> Security -> 2-Step Verification -> App passwords, and update SMTP_PASS in server/.env.'
      );
      authErr.code = 'GMAIL_APP_PASS_REQUIRED';
      throw authErr;
    }
    throw error;
  }
}

export { isMailConfigured };

