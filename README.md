# Angular 20 & NestJS 11.1.6 — Candidate Loader

**Author:** Gabriel Cárdenas Martinez

A full-stack app with **Angular 20** (standalone, Material, reactive forms + signals) and **NestJS 11.1.6** (TypeORM + MySQL).

Users upload a candidate’s name/surname and a single-row Excel file; the backend parses the row and returns a merged candidate which is listed in the UI. You can also delete one/all candidates.

---

## 1) Quick start

### Prereqs

* Node.js 20+ (LTS recommended)
* Docker (for MySQL, optional but recommended)

### Dev scripts from repo root

```json
{
  "scripts": {
    "dev:db": "docker compose up -d",
    "dev:api": "cd backend && npm run start:dev",
    "dev:ui": "cd frontend && npm start"
  }
}
```

### Bring everything up

```bash
# 1) Database (Docker)
npm run dev:db

# 2) Backend (NestJS)
cd backend
npm install
# If you use migrations:
npm run typeorm:run   # creates DB tables via TypeORM migrations
# Then:
npm run start:dev

# 3) Frontend (Angular)
cd ../frontend
npm install
npm start
```

* Angular dev server: [http://localhost:4200](http://localhost:4200)
* API server (Nest): [http://localhost:3000](http://localhost:3000)

---

## 2) Frontend (Angular 20)

* Standalone components, Angular Material, reactive forms, and a small signal-based store.
* A **route resolver** preloads persisted candidates on first load.
* **Proxy** is configured so the UI calls `/api/*` and it forwards to the backend.

Run:

```bash
cd frontend
npm start
```

**Environment & proxy**

* `src/environments/environment.ts` sets `apiBaseUrl: '/api'`.
* `proxy.conf.json` maps `/api` to `http://localhost:3000`.

  * If your Nest app does **not** use a global prefix `/api`, enable a rewrite:

    ```json
    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false,
        "changeOrigin": true,
        "logLevel": "info",
        "pathRewrite": { "^/api": "" }
      }
    }
    ```
  * If you **do** use a global prefix (`app.setGlobalPrefix('api')`) you don’t need `pathRewrite`.

**Testing (Jasmine/Karma)**

```bash
cd frontend
npm test      # watch mode
```

---

## 3) Backend (NestJS 11.1.6 + TypeORM)

The API parses Excel using `xlsx`, normalizes columns, validates, and persists to MySQL via TypeORM. For e2e it can run against in-memory SQLite.

Run:

```bash
cd backend
npm install
npm run start:dev
```

**Database options**

* **With Docker** (recommended). Minimal `docker-compose.yml` in the repo:

  ```yaml
  version: "3.8"
  services:
    db:
      image: mysql:8.0
      environment:
        MYSQL_DATABASE: candidates
        MYSQL_USER: app
        MYSQL_PASSWORD: app
        MYSQL_ROOT_PASSWORD: root
      ports:
        - "3306:3306"
      volumes:
        - db:/var/lib/mysql
  volumes:
    db: {}
  ```

* **Backend `.env` example**:

  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=app
  DB_PASSWORD=app
  DB_NAME=candidates
  ```

* **Migrations** (if enabled):
  The backend has a script like:

  ```json
  {
    "scripts": {
      "typeorm:run": "typeorm-ts-node-commonjs migration:run -d src/data-source.ts"
    }
  }
  ```

  Run:

  ```bash
  npm run typeorm:run
  ```

**Testing (Jest)**

```bash
cd backend
npm test           # unit
npm run test:e2e   # e2e (uses SQLite in-memory)
```

---

## 4) API

If you use a global prefix, all routes are under `/api`. Otherwise drop the `/api` in the examples.

* **GET** `/api/candidates`
  Returns the list of persisted candidates (reverse chronological).

* **POST** `/api/candidates` (multipart/form-data)
  Fields: `name`, `surname`, `file` (Excel).
  Response: the saved candidate (merged).

* **DELETE** `/api/candidates/:id`
  Deletes a single candidate.

* **DELETE** `/api/candidates`
  Bulk delete; returns `{ deleted: number }`.

**cURL example**

```bash
curl -X POST http://localhost:3000/api/candidates \
  -F "name=Ada" \
  -F "surname=Lovelace" \
  -F "file=@./cand.xlsx"
```

---

## 5) Excel input format

The Excel must include a **single data row** (headers allowed) with **three columns**:

1. `seniority` — `junior` or `senior`
2. `years` — numeric (supports `2,5` as comma decimal)
3. `availability` — boolean-ish (`true/false`, `1/0`, `yes/no`, `si/sí`)

The parser is tolerant with header names (English/Spanish, spaces, snake/camel).

### Sample files

Two sample Excel files are provided under:

```
frontend/src/assets/samples/
  candidate-sample-1.xlsx
  candidate-sample-2.xlsx
```

Use them directly from the UI.

---

## 6) Architecture & noteworthy choices

* **Angular 20 standalone**: minimal NgModule boilerplate, functional DI (`inject()`), signals for local state.
* **Material** UI, custom file-upload button, route resolver to hydrate from backend.
* **NestJS** with DTO validation, robust Excel parsing and normalization, MySQL persistence via TypeORM.
* **Testing**:

  * Backend: Jest unit & e2e (SQLite in-memory for e2e).
  * Frontend: Jasmine/Karma unit tests (service, store, component).
* **Animations**: No global `provideAnimations()` (deprecated). Use component-level `@animate.enter` / `@animate.leave` if needed later.

---

## 7) Troubleshooting

* **UI requests return 404 to `/api/*`**
  Ensure either:

  * Proxy `pathRewrite` strips `/api`, **or**
  * Nest uses `app.setGlobalPrefix('api')`.

* **Node deprecation `[DEP0060] util._extend`** in dev
  Comes from a third-party package (often dev proxy). Safe to ignore; updating dependencies usually removes it.

