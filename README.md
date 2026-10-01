# Aplikasi Tiket Film

A cinema ticket booking application with a Vue frontend, NestJS backend, PostgreSQL database, Prisma ORM, and Docker Compose.

## Requirements

- Docker Desktop with Docker Compose
- Node.js 22 or later for local development
- npm

## Run With Docker

Run these commands from the project root:

```powershell
docker compose up -d --build
```

The services are exposed at:

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433

Check service status:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs -f
```

View only backend logs:

```powershell
docker compose logs -f backend
```

Stop the services while keeping the database volume:

```powershell
docker compose down
```

Remove the services and database data:

```powershell
docker compose down -v
```

The last command is destructive and removes the PostgreSQL volume.

## Seed the Database

Database migrations run automatically when the backend starts. The seed script must be run after the containers are running:

```powershell
docker compose exec backend npx prisma db seed
```

The current seed script deletes existing users, movies, studios, showtimes, bookings, and booked seats before inserting sample data. Do not run it against data that must be preserved.

## Rebuild After Changes

After changing backend or frontend source code, rebuild the affected service:

```powershell
docker compose up -d --build backend
```

For frontend changes:

```powershell
docker compose up -d --build frontend
```

To force a clean backend image build:

```powershell
docker compose build --no-cache backend
docker compose up -d backend
```

## Local Development Without Docker

### Backend

Start PostgreSQL separately, then configure `backend-tiket-film/.env` with a local connection string:

```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/cinema_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

Install dependencies and start the backend:

```powershell
cd backend-tiket-film
npm install
npx prisma migrate dev
npm run start:dev
```

The backend runs at http://localhost:3000.

### Frontend

In a second terminal:

```powershell
cd frontend-tiket-film
npm install
npm run dev
```

The Vite development server runs at the URL shown in the terminal. API requests use the local Vite proxy and are forwarded to `http://localhost:3000`.

## Database Commands

Apply existing migrations in the running backend container:

```powershell
docker compose exec backend npx prisma migrate deploy
```

Create a new migration during local development:

```powershell
cd backend-tiket-film
npx prisma migrate dev --name describe_the_change
```

Regenerate the Prisma client:

```powershell
docker compose exec backend npx prisma generate
```

## Troubleshooting

### Port already in use

The default ports are `8080`, `3000`, and `5433`. Check running containers if one is unavailable:

```powershell
docker ps
```

Stop an old PostgreSQL container if it is occupying port `5433`:

```powershell
docker stop cinema_postgres
```

### Backend cannot connect to PostgreSQL

Use `postgres:5432` as the database host and port from inside Docker. Do not use `localhost:5433` in the backend container. The Compose configuration already uses the correct internal connection string.

### Prisma client is missing

Rebuild the backend image so Prisma Client is generated inside the image:

```powershell
docker compose build --no-cache backend
docker compose up -d backend
```
