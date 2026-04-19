# Virtual Employees Frontend

Client-side React app for an AI meeting orchestration system for solo founders.

## Stack

- React 18
- Vite
- TypeScript
- React Router
- Zustand
- TanStack Query
- Tailwind CSS
- react-hook-form + zod
- axios
- Native WebSocket

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Run the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Environment

- `VITE_API_BASE_URL` sets the REST API base URL. The app defaults to `http://localhost:8000`.
- `VITE_WS_BASE_URL` sets the websocket base URL. The app defaults to `ws://localhost:8000`.
- `VITE_USE_MOCK_DATA=true` enables the local mock backend so the app can run without the backend.

## Notes

- The real API contract is assumed from `specs.json`.
- The mock backend is still available as an opt-in fallback for offline development.
- The meeting room listens for live updates, auto-scrolls the transcript, and keeps the summary/decision panel updated as events arrive.
