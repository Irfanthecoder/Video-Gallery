# Video Gallery

Upload videos with metadata, generate and pick thumbnails, and browse a searchable gallery.

## Tech stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Multer, fluent-ffmpeg
- **Frontend**: React 18, Vite, TypeScript, React Router, Zustand, Framer Motion
- **Database**: PostgreSQL

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+** (local or free cloud)

FFmpeg is **bundled with the backend** via `@ffmpeg-installer/ffmpeg` — no separate install. Running `npm install` in `backend/` downloads the correct FFmpeg binary for your OS so thumbnails work out of the box.

## Run the project

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`. **Use the same user and password as your local PostgreSQL** (e.g. the password you set for the `postgres` user):

```env
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/video_gallery
```

Apply the database schema:

```bash
npm run db:schema
```

Start the server:

```bash
npm run dev
```

Backend runs at **http://localhost:4000**. Uploads go to `backend/uploads/`.  
**Development:** `npm run dev` uses nodemon — it watches `src/` and restarts the server when you change any `.ts` file. No need to run `npm run build` or restart manually. **Production:** run `npm run build` then `npm run start`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**. It proxies `/api` and `/uploads` to the backend.

### 3. Quick check

1. Open http://localhost:3000/upload
2. Enter a **title**, optional description and tags, pick a **video file**, click **Upload**
3. After upload, thumbnails are generated; click one to set it as primary
4. Go to **Gallery**, use search and tag filter, open a video to see the detail page

## Troubleshooting

- **Database connection failed**: Ensure PostgreSQL is running and `DATABASE_URL` in `backend/.env` matches your DB (user, password, host, port, database name).
- **Schema already applied**: `npm run db:schema` is safe to run again (uses `CREATE TABLE IF NOT EXISTS`).
- **Thumbnails not generated**: Ensure you ran `npm install` in `backend/` (FFmpeg is bundled). If you still see “No preview”, check backend logs for the exact error.
- **Port in use**: Change `PORT` in `backend/.env` or the frontend port in `frontend/vite.config.ts`.

## Project layout

- **backend/src**
  - **interfaces** (shared types): `video.interface.ts`, `thumbnail.interface.ts`, `pagination.interface.ts`; `WhereCondition`, `AndOrQuery`, `FindWithFilterOptions` re-exported from `db/interfaces/`. Import with `import type { Video, AndOrQuery } from './interfaces'`.
  - **db** (all DB in one place): `client.ts`, `helper/` (query-builder, and-or-query-builder, postgres.helper), `query-helper/` (findAll, findOne, findWithFilter, countWithFilter, createOne, updateOne), `constants.ts`. DAL uses only these helpers; no raw SQL. Filtered lists use findWithFilter + AndOrQuery.
  - Other layers: `config/`, `constants/`, `utils/` (e.g. videoFileUtils, validationHelpers), `middlewares/`, `validations/`, `controllers/`, `services/`, `dal/`, `models/`, `routes/`. Use barrel imports.
- **frontend/src**
  - **services** (all API in one place): `api/` (client with request, mediaUrl), `video.service.ts` (calls api). Components/hooks use `videoService` only; no fetch in UI.
  - Other: `constants/`, `utils/`, `store/`, `hooks/`, `components/`, `layouts/`, `pages/`, `routes/`. Use `import { ROUTES } from '../constants'`, `from '../services'`, etc.
