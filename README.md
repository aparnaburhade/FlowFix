# FlowFix

FlowFix is an AI-powered DevOps incident diagnosis tool.

This starter project includes:

- `frontend`: React + Vite app
- `backend`: Node.js + Express API

## Project Structure

frontend/
backend/

## Quick Start

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` by default.

## API Contract (Starter)

`POST /api/diagnose`

Request body:

```json
{
	"event_id": "evt-1001",
	"source": "deploy-pipeline",
	"event_type": "deployment_failure",
	"service": "payments-api",
	"environment": "production",
	"timestamp": "2026-03-17T10:24:00Z",
	"error_summary": "Deployment failed: Missing ENV variable DATABASE_URL",
	"log_excerpt": "Process exited with code 1. Error: undefined DATABASE_URL"
}
```

Response shape:

```json
{
	"incident_type": "string",
	"severity": "low | medium | high | critical",
	"confidence": 0.0,
	"root_cause": "string",
	"recommended_actions": ["string"],
	"requires_human_approval": true
}
```
