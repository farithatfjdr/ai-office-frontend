# ai-office-frontend

Northgate Office UI for the AI Office backend.

**API:** https://api-aioffice.fjdresources.com  
**UI (deploy target):** https://ai-office.fjdresources.com

## Setup

```bash
npm install
cp .env.example .env.local   # optional overrides
npm run dev
```

Sign in with a 6-digit TOTP code. First-time MFA setup on the API:

```bash
curl https://api-aioffice.fjdresources.com/api/auth/setup
```

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API origin (default: `https://api-aioffice.fjdresources.com`) |

## Build

```bash
npm run build
```

## Coolify deployment

1. Create resource in Coolify → FJ Dynamic Resources → production
2. Point at this repo; use `docker-compose.yaml`
3. Domain: **ai-office.fjdresources.com** → port **80**
4. Cloudflare Tunnel: origin `https://localhost:443`, **No TLS Verify** on
5. Backend `CORS_ORIGIN` must be `https://ai-office.fjdresources.com`

## API endpoints used

- `POST /api/auth/login` — TOTP → JWT
- `GET /api/auth/verify` — session check
- `POST /api/message/:agentId` — agent chat (War Room → `chief-of-staff`)

Projects, tasks, and files remain local mock data until backend endpoints exist.

## Related repo

Backend: https://github.com/farithatfjdr/ai-office-backend
