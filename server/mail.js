import nodemailer from 'nodemailer';

/*
 * Contact-form mail delivery.
 *
 * Render's FREE plan blocks all outbound SMTP ports (25, 465, 587), so Gmail
 * SMTP can never connect from there. In production we send through an HTTPS
 * email API instead. Provider is picked in this order:
 *
 *   1. RESEND_API_KEY  -> Resend  (https://resend.com)
 *   2. BREVO_API_KEY   -> Brevo   (https://brevo.com)
 *   3. SMTP_USER/PASS  -> nodemailer SMTP (works locally / on paid Render plans)
 */

const SMTP_TIMEOUT_MS = 12000;
const HTTP_TIMEOUT_MS = 15000;

function cleanEnv(value) {
  return (value || '').trim().replace(/^['"]|['"]$/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mailProvider() {
  if (cleanEnv(process.env.RESEND_API_KEY)) return 'resend';
  if (cleanEnv(process.env.BREVO_API_KEY)) return 'brevo';
  if (cleanEnv(process.env.SMTP_USER) && cleanEnv(process.env.SMTP_PASS)) return 'smtp';
  return null;
}

function isMailConfigured() {
  return Boolean(mailProvider());
}

function recipient() {
  return (
    cleanEnv(process.env.CONTACT_TO_EMAIL) ||
    cleanEnv(process.env.SMTP_USER) ||
    cleanEnv(process.env.BREVO_SENDER_EMAIL)
  );
}

function buildMessage({ name, email, message }) {
  return {
    subject: `Portfolio message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <h2>New portfolio contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `,
  };
}

async function postJson(url, headers, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.message || data.error || data.code || response.statusText;
      const err = new Error(`Email API error (${response.status}): ${detail}`);
      err.code = 'MAIL_API_ERROR';
      throw err;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const err = new Error('The email service did not respond in time. Please try again.');
      err.code = 'MAIL_TIMEOUT';
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Resend ---------- */
async function sendWithResend(contact) {
  const content = buildMessage(contact);
  // Without a verified domain, Resend only allows sending FROM onboarding@resend.dev
  // TO the email address you signed up to Resend with.
  const from = cleanEnv(process.env.MAIL_FROM) || 'Portfolio Contact <onboarding@resend.dev>';

  await postJson(
    'https://api.resend.com/emails',
    { Authorization: `Bearer ${cleanEnv(process.env.RESEND_API_KEY)}` },
    {
      from,
      to: [recipient()],
      reply_to: contact.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    }
  );
}

/* ---------- Brevo ---------- */
async function sendWithBrevo(contact) {
  const content = buildMessage(contact);
  // Must be a sender address you verified in Brevo (Senders & IPs -> Senders).
  const senderEmail =
    cleanEnv(process.env.BREVO_SENDER_EMAIL) ||
    cleanEnv(process.env.SMTP_USER) ||
    recipient();

  await postJson(
    'https://api.brevo.com/v3/smtp/email',
    { 'api-key': cleanEnv(process.env.BREVO_API_KEY) },
    {
      sender: { name: 'Portfolio Contact', email: senderEmail },
      to: [{ email: recipient() }],
      replyTo: { email: contact.email, name: contact.name },
      subject: content.subject,
      textContent: content.text,
      htmlContent: content.html,
    }
  );
}

/* ---------- SMTP (local dev / paid hosting) ---------- */
function smtpAuth() {
  return {
    user: cleanEnv(process.env.SMTP_USER),
    pass: cleanEnv(process.env.SMTP_PASS).replace(/\s+/g, ''),
  };
}

async function sendWithSmtp(contact) {
  const content = buildMessage(contact);
  const port = Number(cleanEnv(process.env.SMTP_PORT)) || 465;
  const transporter = nodemailer.createTransport({
    host: cleanEnv(process.env.SMTP_HOST) || 'smtp.gmail.com',
    port,
    secure: cleanEnv(process.env.SMTP_SECURE) === 'true' || port === 465,
    auth: smtpAuth(),
    family: 4,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${smtpAuth().user}>`,
      to: recipient(),
      replyTo: contact.email,
      ...content,
    });
  } catch (error) {
    if (error?.code === 'EAUTH' || error?.responseCode === 535) {
      const err = new Error(
        'Gmail authentication failed. Use a 16-character App Password in SMTP_PASS.'
      );
      err.code = 'GMAIL_APP_PASS_REQUIRED';
      throw err;
    }
    if (['ETIMEDOUT', 'ESOCKET', 'ECONNECTION'].includes(error?.code) || /timeout/i.test(error?.message || '')) {
      const err = new Error(
        'Could not reach the SMTP server. Render free instances block SMTP ports — set RESEND_API_KEY or BREVO_API_KEY instead.'
      );
      err.code = 'SMTP_TIMEOUT';
      throw err;
    }
    throw error;
  } finally {
    transporter.close();
  }
}

export async function sendContactEmail(contact) {
  const provider = mailProvider();

  if (!provider) {
    const err = new Error(
      'Email is not configured on the server. Set RESEND_API_KEY (or BREVO_API_KEY) in the environment.'
    );
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  if (!recipient()) {
    const err = new Error('CONTACT_TO_EMAIL is not set.');
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  try {
    if (provider === 'resend') return await sendWithResend(contact);
    if (provider === 'brevo') return await sendWithBrevo(contact);
    return await sendWithSmtp(contact);
  } catch (error) {
    console.error(`Mail send failed via ${provider}:`, error.code || '', error.message);
    throw error;
  }
}

export { isMailConfigured, mailProvider };
