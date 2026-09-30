# Subhajit Mahapatra — Portfolio

Full-stack personal portfolio: **React (Vite)** + **Express/Node** + **SQLite**.

**Live site:** [subhajit-mahapatra-portfolio.onrender.com](https://subhajit-mahapatra-portfolio.onrender.com)

## Quick start

```bash
npm run install:all

# Terminal 1 — API
npm run start:server

# Terminal 2 — Frontend
npm run dev
```

## Environment variables

Keep secrets and deploy URLs out of source. Use the example files:

| File | Purpose |
|------|---------|
| `.env.example` | Frontend template → copy to `.env` |
| `server/.env.example` | Backend template → copy to `server/.env` |

### Frontend (`.env`)

```env
# Empty in local dev (uses Vite `/api` proxy)
# Production: full API base including /api
VITE_API_URL=https://subhajit-mahapatra-portfolio.onrender.com/api
```

### Backend (`server/.env`)

```env
PORT=5000
CORS_ORIGIN=https://subhajit-mahapatra-portfolio.onrender.com
```

## Contact form email

Contact messages are emailed to `CONTACT_TO_EMAIL`. The server picks a mail provider automatically (first match wins):

| Priority | Env var(s) | Provider | Use for |
|---|---|---|---|
| 1 | `RESEND_API_KEY` | [Resend](https://resend.com) HTTPS API | **Production on Render (recommended)** |
| 2 | `BREVO_API_KEY` + `BREVO_SENDER_EMAIL` | [Brevo](https://brevo.com) HTTPS API | Production alternative |
| 3 | `SMTP_USER` + `SMTP_PASS` | Gmail SMTP via Nodemailer | Local development |

> **Why not Gmail SMTP on Render?** Render's free plan blocks all outbound SMTP ports (25, 465, 587), so SMTP connections time out there. The HTTPS email APIs above are not blocked.

### Resend setup (production)

1. Sign up at [resend.com](https://resend.com) with the **same email** as `CONTACT_TO_EMAIL`. Without a verified domain, Resend only delivers to your own account email, which is all a contact form needs.
2. Go to **API Keys → Create API Key** (Sending access) and copy the `re_...` key.
3. Add `RESEND_API_KEY` in Render → Environment. Never commit the key.

Emails arrive from `onboarding@resend.dev` with **Reply-To** set to the visitor, so hitting Reply answers them directly. After verifying your own domain in Resend you can set `MAIL_FROM=Portfolio <contact@yourdomain.com>`.

### Gmail SMTP (local development)

1. In `server/.env`, set `SMTP_USER` and `SMTP_PASS`. `SMTP_PASS` must be a Gmail **App Password**, not your normal password (Google Account → Security → 2-Step Verification → App passwords).
2. Restart the API: `npm run start:server`

If no provider is configured, the contact form returns an error instead of pretending to send mail.

## Deploy on Render (one Web Service)

Use a **Web Service**, not a Static Site. The Express server both serves the React build and handles `/api/contact`.

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `npm run install:all && npm run build` |
| Start command | `npm start` |
| Health check | `/api/health` |

Environment variables (Render Dashboard → Environment):

```
CORS_ORIGIN=*
CONTACT_TO_EMAIL=you@gmail.com
RESEND_API_KEY=re_your_resend_api_key
```

Important:

- Do **not** set `VITE_API_URL` when frontend and API are the same Render service. Leave it empty so the form posts to `/api/contact`.
- After changing env vars, **restart** the service. Mail vars do not need a rebuild; `VITE_*` vars do.
- Any `SMTP_*` vars left in Render are ignored once `RESEND_API_KEY` is set.
- Check [https://subhajit-mahapatra-portfolio.onrender.com/api/health](https://subhajit-mahapatra-portfolio.onrender.com/api/health). It should show `"mailConfigured": true` and `"mailProvider": "resend"`.

## Featured projects

- **FamilyWellcare**: [Live](https://family-care-frontend.vercel.app/) · [Frontend](https://github.com/Subhajit7710/FamilyCareFrontend) · [Backend](https://github.com/Subhajit7710/FamilyCareBackend)
- [JustAdvisor AI](https://github.com/Subhajit7710/JustAdvisor_AI)
