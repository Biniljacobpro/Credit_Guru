# CreditGuru

CreditGuru is a full-stack invoice and payment management application built using React.js, Node.js, Express.js, and PostgreSQL (Neon).

## Development Workflow

### 1. Database Setup
- Created a PostgreSQL database in Neon.
- Copied the Neon database connection string.

### 2. Backend Setup

Initialized the backend project:

```bash
npm init -y
```

Installed dependencies:

```bash
npm install express pg dotenv cors
npm install -D nodemon
```

### 3. Configured package.json

Added the following scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### 4. Backend Development

- Created the backend folder structure.
- Configured the `.env` file with the Neon PostgreSQL connection string.
- Created `db.js` for PostgreSQL database connectivity.
- Created `app.js` and configured Express, middleware and API routes.
- Created `server.js` to start the backend server.

### 5. Backend Testing

Started the backend:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

- Checked the API endpoints.
- Verified database connectivity.
- Tested customer, invoice and payment operations.

### 6. Frontend Development

- Built the frontend modules using React.js and Vite.
- Connected the frontend with the backend APIs using Axios.
- Integrated customer, invoice and payment functionalities.
- Verified that both frontend and backend work correctly.

### 7. Deployment

- Pushed the project to GitHub.
- Deployed the frontend and backend using Vercel.
- Configured the required environment variables.
- Connected the deployed application to Neon PostgreSQL.

## Live Application

**CreditGuru:** https://credit-guru-eosin.vercel.app/