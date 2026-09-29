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


1. Build frontend: `npm run build` → deploy `dist/`
2. Host the Express API separately (Render, Railway, etc.)
3. Set `VITE_API_URL` to your live API `/api` URL before building
4. Set `CORS_ORIGIN` on the server to your live frontend origin(s)

## Featured projects

- [FamilyCare Frontend](https://github.com/Subhajit7710/FamilyCareFrontend)
- [FamilyCare Backend](https://github.com/Subhajit7710/FamilyCareBackend)
- [JustAdvisor AI](https://github.com/Subhajit7710/JustAdvisor_AI)
