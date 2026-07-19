# FashionSwap

FashionSwap is a full-stack marketplace application with separate backend and frontend projects.

## Repository structure

- `FashionSwap-backend/` — Express + TypeScript backend with Mongoose, JWT authentication, and Jest tests.
- `FashionSwap-frontend/` — Next.js frontend application with Tailwind CSS.
- `.github/workflows/` — GitHub Actions workflows for backend CI, frontend CI, and CodeQL analysis.

## Running locally

### Backend

```bash
cd FashionSwap-backend
npm ci
npm run lint
npm run build
npm test -- --runInBand
```

The backend uses MongoDB. For local development, run MongoDB before starting the backend.

### Frontend

```bash
cd FashionSwap-frontend
npm ci
npm run dev
```

## CI

This repository includes workflows for:

- backend CI (`.github/workflows/backend-ci.yml`)
- frontend CI (`.github/workflows/frontend-ci.yml`)
- CodeQL security analysis (`.github/workflows/codeql.yml`)

The backend CI workflow preserves `npm audit` output by generating a JSON report and uploading it as an artifact instead of failing on known dependency vulnerabilities.

## Notes
- The repository uses `sprint4` as an active feature branch for CI branches.
