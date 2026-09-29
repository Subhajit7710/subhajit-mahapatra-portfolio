# Subhajit Mahapatra — Portfolio

Full-stack personal portfolio: **React (Vite)** + **Express/Node** + **SQLite**.

## Quick start

```bash
npm run install:all

# Terminal 1 — API
npm run start:server

# Terminal 2 — Frontend
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  

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
VITE_API_URL=https://your-api.example.com/api
```

### Backend (`server/.env`)

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173,https://your-frontend.example.com
```

## Contact form email

Messages are emailed with Nodemailer (Gmail SMTP).

1. Open `server/.env`
2. Set `SMTP_PASS` to a Gmail **App Password** (not your normal password)
3. Restart the API: `npm run start:server`

Create an app password: Google Account → Security → 2-Step Verification → App passwords.

Without `SMTP_PASS`, the contact form returns an error instead of pretending to send mail.

## Deploy on Render (one Web Service)

Use a **Web Service**, not a Static Site. The Express server both serves the React build and handles `/api/contact`.

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `npm install && npm --prefix server install && npx vite build` |
| Start command | `npm start` |
| Health check | `/api/health` |

Environment variables (Render Dashboard → Environment):

```
CORS_ORIGIN=*
CONTACT_TO_EMAIL=you@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@gmail.com
SMTP_PASS=your_16_char_gmail_app_password
```

Important:

- Do **not** set `VITE_API_URL` when frontend and API are the same Render service. Leave it empty so the form posts to `/api/contact`.
- After changing env vars, **restart** the service. SMTP vars do not need a rebuild; `VITE_*` vars do.
- On Render, Gmail port 587 often hangs. Use **465** + `SMTP_SECURE=true`.
- Check `https://your-app.onrender.com/api/health` — `mailConfigured` should be `true`.

## Featured projects

- [FamilyCare Frontend](https://github.com/Subhajit7710/FamilyCareFrontend)
- [FamilyCare Backend](https://github.com/Subhajit7710/FamilyCareBackend)
- [JustAdvisor AI](https://github.com/Subhajit7710/JustAdvisor_AI)
