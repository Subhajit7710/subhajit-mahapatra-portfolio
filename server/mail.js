import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = 12000;

function cleanEnv(value) {
  return (value || '').trim().replace(/^['"]|['"]$/g, '');
}

function isMailConfigured() {
  return Boolean(cleanEnv(process.env.SMTP_USER) && cleanEnv(process.env.SMTP_PASS));
}

function authConfig() {
  return {
    user: cleanEnv(process.env.SMTP_USER),
    pass: cleanEnv(process.env.SMTP_PASS).replace(/\s+/g, ''),
  };
}

function transportOptions({ host, port, secure }) {
  return {
    host,
    port,
    secure,
    auth: authConfig(),
    family: 4,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    tls: {
      minVersion: 'TLSv1.2',
    },
  };
}

function gmailAttempts() {
  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.gmail.com';

  const attempts = [
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false },
    {
      host,
      port: Number(cleanEnv(process.env.SMTP_PORT)) || 465,
      secure:
        cleanEnv(process.env.SMTP_SECURE) === 'true' ||
        Number(cleanEnv(process.env.SMTP_PORT)) === 465,
    },
  ];

  const seen = new Set();
  return attempts.filter((attempt) => {
    const key = `${attempt.host}:${attempt.port}:${attempt.secure}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isAuthError(error) {
  return error?.code === 'EAUTH' || error?.responseCode === 535;
}

function isTimeoutError(error) {
  return ['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNECTION', 'ETLS', 'EENVELOPE'].includes(
    error?.code
  ) || /timeout|timed out/i.test(error?.message || '');
}

export async function sendContactEmail({ name, email, message }) {
  if (!isMailConfigured()) {
    const err = new Error(
      'Email is not configured on the server. Please set SMTP_USER and SMTP_PASS in environment variables.'
    );
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  const to = cleanEnv(process.env.CONTACT_TO_EMAIL) || authConfig().user;
  const mail = {
    from: `"Portfolio Contact" <${authConfig().user}>`,
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
  };

  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const isGmail = host.includes('gmail') || authConfig().user.endsWith('@gmail.com');
  const attempts = isGmail
    ? gmailAttempts()
    : [
        {
          host,
          port: Number(cleanEnv(process.env.SMTP_PORT)) || 587,
          secure:
            cleanEnv(process.env.SMTP_SECURE) === 'true' ||
            Number(cleanEnv(process.env.SMTP_PORT)) === 465,
        },
      ];

  let lastError;

  for (const attempt of attempts) {
    try {
      const transporter = nodemailer.createTransport(transportOptions(attempt));
      await transporter.sendMail(mail);
      transporter.close();
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `SMTP failed on ${attempt.host}:${attempt.port} (secure=${attempt.secure}):`,
        error.code || error.message
      );

      if (isAuthError(error)) {
        const authErr = new Error(
          'Gmail authentication failed. Use a 16-character App Password in SMTP_PASS (not your Gmail login password), then restart the Render service.'
        );
        authErr.code = 'GMAIL_APP_PASS_REQUIRED';
        throw authErr;
      }
    }
  }

  if (isTimeoutError(lastError)) {
    const timeoutErr = new Error(
      'The mail server did not respond in time. Render often blocks or delays SMTP; try SMTP_PORT=465 and SMTP_SECURE=true, then restart the service.'
    );
    timeoutErr.code = 'SMTP_TIMEOUT';
    throw timeoutErr;
  }

  throw lastError;
}

export { isMailConfigured };
