# ArcadiaX Dashboard

Premium React dashboard for the **ArcadiaX** Discord management bot.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP | Axios (with session cookies) |
| Icons | Lucide React |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Configure env
#   VITE_API_URL=http://localhost:5000     ← your backend URL
#   VITE_DEV_AUTH=true                     ← dev bypass (disable in prod!)

# 4. Start dev server
npm run dev
# → http://localhost:3000

# 5. Production build
npm run build
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |
| `VITE_DEV_AUTH` | Skip Discord OAuth in dev (adds `x-dev-admin: true`) | `false` |

> **Never set `VITE_DEV_AUTH=true` in production.**

## Pages

| Route | Page |
|---|---|
| `/login` | Discord OAuth2 login |
| `/dashboard` | Overview + stats |
| `/dashboard/antinuke` | Anti-Nuke configuration |
| `/dashboard/antibetray` | Anti-Betray configuration |
| `/dashboard/backup` | Server backup manager |
| `/dashboard/welcome` | Welcome & goodbye messages |
| `/dashboard/autorole` | Auto role assignment |
| `/dashboard/embed` | Embed builder + live preview |
| `/dashboard/messages` | Message sender |
| `/dashboard/music` | Music player controls |
| `/dashboard/tickets` | Ticket management + panel deploy |
| `/dashboard/logs` | Security / message / activity logs |
| `/dashboard/settings` | Bot & server settings |

## Deploying to Vercel

1. Push to GitHub
2. Import repository in [vercel.com](https://vercel.com)
3. Set **Framework Preset** → `Vite`
4. Add environment variables:
   - `VITE_API_URL` → your hosted backend URL (e.g. `https://api.yourdomain.com`)
   - `VITE_DEV_AUTH` → `false`
5. Deploy

The app is a pure static SPA — Vite builds to `dist/` and Vercel serves it correctly.

## API Contract

All API calls use `withCredentials: true` (session cookies).  
All responses follow: `{ success: boolean, data: T, message: string }`.  
401 responses automatically redirect to `/login`.

See the backend's `FRONTEND_API_GUIDE.md` and `docs/API.md` for full endpoint documentation.

## Project Structure

```
src/
├── components/     Reusable UI components
│   ├── ChannelSelect.jsx
│   ├── DataTable.jsx
│   ├── EmbedPreview.jsx
│   ├── ErrorState.jsx
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   ├── RoleSelect.jsx
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   └── Toggle.jsx
├── context/        Global state
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
├── hooks/          Custom hooks
│   └── useGuildData.js
├── layouts/
│   └── DashboardLayout.jsx
├── pages/          One file per route
├── services/
│   └── api.js      All Axios API calls
├── App.jsx         Router + providers
├── main.jsx        Vite entry
└── index.css       Design system + Tailwind v4
```
