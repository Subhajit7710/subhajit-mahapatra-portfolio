import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { seedIfEmpty } from './seed.js';
import { sendContactEmail, isMailConfigured } from './mail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

const db = await initDb();
await seedIfEmpty(db);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mailConfigured: isMailConfigured(),
  });
});

app.get('/api/profile', (_req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const education = db
    .prepare('SELECT * FROM education ORDER BY sort_order ASC')
    .all();
  const experience = db
    .prepare('SELECT * FROM experience ORDER BY sort_order ASC')
    .all();

  res.json({ ...profile, education, experience });
});

app.get('/api/skills', (_req, res) => {
  const skills = db
    .prepare('SELECT * FROM skills ORDER BY sort_order ASC')
    .all();

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {});

  res.json({ skills, grouped });
});

app.get('/api/projects', (_req, res) => {
  const projects = db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC')
    .all();
  res.json(projects);
});

app.get('/api/certifications', (_req, res) => {
  const certifications = db
    .prepare('SELECT * FROM certifications ORDER BY sort_order ASC')
    .all();
  res.json(certifications);
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res
      .status(400)
      .json({ error: 'Name, email, and message are required.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res
      .status(400)
      .json({ error: 'Please provide a valid email address.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  try {
    await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    });

    const result = db
      .prepare(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)'
      )
      .run(cleanName, cleanEmail, cleanMessage);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Thanks for reaching out! I will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact email failed:', error.message);

    if (error.code === 'MAIL_NOT_CONFIGURED') {
      return res.status(503).json({
        error:
          'Email delivery is not set up yet. Add SMTP settings in server/.env (see server/.env.example).',
      });
    }

    if (error.code === 'GMAIL_APP_PASS_REQUIRED') {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(502).json({
      error:
        'Could not send your message right now. Please try again later or email me directly.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
  console.log(
    `Mail configured: ${isMailConfigured() ? 'yes' : 'no (set SMTP_* in server/.env)'}`
  );
});
