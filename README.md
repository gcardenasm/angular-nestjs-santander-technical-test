# Angular 20 & NestJS 11.1.6 Candidate Loader

This repository contains a full‑stack application built with **Angular 20** on the front end and **NestJS 11.1.6** on the back end.  The goal of this project is to provide a simple, reactive form that allows the user to upload candidate information along with a single‑line Excel file.  The server parses the Excel row and combines it with the provided name and surname, returning a JSON object which is then added to a table on the front end.  The table lists all previously uploaded candidates with their name, surname, seniority, years of experience and availability.

## Frontend (`frontend/`)

The Angular application uses Angular Material components and reactive forms.  The `CandidateFormComponent` collects the candidate’s name, surname and a file.  Upon submission, it posts the data to the NestJS backend.  The returned candidate object is stored in memory and displayed in a table.  You can start the Angular development server via:

```bash
cd frontend
npm install
npm start
```

The application uses **Angular 20**.  See `frontend/package.json` for a full list of dependencies.

## Backend (`backend/`)

The NestJS service exposes a single endpoint (`POST /candidates`) which accepts a multipart/form request.  The uploaded Excel file is parsed using the `xlsx` package.  The endpoint responds with a JSON payload containing the merged candidate data.  To run the backend server:

```bash
cd backend
npm install
npm run start:dev
```

This will start an HTTP server on port `3000` by default.

## Folder Structure

```
angular-nest-app/
├── backend/        # NestJS 11.1.6 service
│   ├── src/
│   │   ├── candidate/
│   │   │   ├── candidate.controller.ts
│   │   │   ├── candidate.module.ts
│   │   │   ├── candidate.service.ts
│   │   │   ├── dto/
│   │   │   │   └── candidate.dto.ts
│   │   │   └── entities/
│   │   │       └── candidate.entity.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/       # Angular 20 client
    ├── src/
    │   ├── app/
    │   │   ├── candidate-form/
    │   │   │   ├── candidate-form.component.html
    │   │   │   ├── candidate-form.component.scss
    │   │   │   ├── candidate-form.component.ts
    │   │   ├── models/
    │   │   │   └── candidate.ts
    │   │   ├── services/
    │   │   │   └── candidate.service.ts
    │   │   ├── app.component.html
    │   │   ├── app.component.scss
    │   │   ├── app.component.ts
    │   │   └── app.module.ts
    │   ├── index.html
    │   ├── main.ts
    │   ├── polyfills.ts
    │   └── styles.scss
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── tsconfig.app.json
```

## Notes

* The Excel file uploaded must contain **exactly one data row** with three columns: `seniority` (`junior` or `senior`), `years` (numeric) and `availability` (boolean or a truthy/falsy value such as `true`/`false`, `1`/`0`, `yes`/`no`).
* The application stores uploaded candidates in memory on the client side.  A real application might persist these records to a database or local storage.
* The NestJS service uses [`multer`](https://www.npmjs.com/package/multer) for handling multipart forms and [`xlsx`](https://www.npmjs.com/package/xlsx) for parsing the uploaded file.
* Tests (Jest) and exhaustive error handling have been omitted for brevity but can be added following typical NestJS and Angular testing patterns.