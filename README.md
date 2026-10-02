# Store Rating Platform

A full-stack web application where users can rate registered stores from 1 to 5. It has a single login system with three roles: System Administrator, Normal User and Store Owner. Built for the Roxiler Systems Full Stack Developer Intern assessment.

## Features

**System Administrator**
- Dashboard with total users, total stores and total ratings
- Add users (Admin, Normal User, Store Owner) and add stores
- List of stores (Name, Email, Address, Rating) and list of users (Name, Email, Address, Role)
- Filter by Name, Email, Address and Role; sort ascending/descending on all tables
- User details page (a Store Owner's store rating is also shown)

**Normal User**
- Sign up, log in, change password
- View all stores, search by Name and Address
- See overall rating and own rating; submit or modify a rating (1 to 5)

**Store Owner**
- Log in, change password
- Dashboard with the store's average rating and the list of users who rated it

## Tech Stack

- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, Express
- Database: MySQL (mysql2, plain parameterized SQL)
- Auth: JWT, bcrypt password hashing, role-based authorization
- Validation: Zod (backend) and matching rules in the React forms

## Validation Rules

| Field | Rule |
|---|---|
| Name | 20 to 60 characters |
| Address | Maximum 400 characters |
| Password | 8 to 16 characters, at least one uppercase letter and one special character |
| Email | Standard email format, unique |
| Rating | Whole number from 1 to 5 |

## Database Design

- `users` (id, name, email UNIQUE, password_hash, address, role, timestamps)
- `stores` (id, name, email UNIQUE, address, owner_id UNIQUE FK to users, timestamps)
- `ratings` (id, user_id FK, store_id FK, rating with CHECK 1 to 5, timestamps, UNIQUE(user_id, store_id))

A user can rate a store only once (database constraint); the rating can be modified. Average ratings are calculated with SQL `AVG`, not stored. The full schema is in `backend/database/schema.sql`.

## Project Structure

```
roxiler-rating-app/
├── backend/
│   ├── database/        # schema.sql, seed.js
│   ├── src/             # config, controllers, middleware, routes, services, validators, utils
│   └── server.js
└── frontend/
    └── src/             # components, context, layouts, pages, routes, services, utils
```

## Setup

### Prerequisites
Node.js, npm and MySQL 8 installed and MySQL running.

### 1. Database
```
mysql -u root -p
```
```sql
CREATE DATABASE roxiler_rating_app;
USE roxiler_rating_app;
source /full/path/to/backend/database/schema.sql;
EXIT;
```

### 2. Backend
```
cd backend
npm install
```
Copy `.env.example` to `.env` and fill in your MySQL password and a long random `JWT_SECRET`. Then:
```
node database/seed.js
npm run dev
```
The API runs on http://localhost:5000

### 3. Frontend
```
cd frontend
npm install
```
Copy `.env.example` to `.env`. Then:
```
npm run dev
```
The app runs on http://localhost:5173

## Demo Credentials (created by the seed script)

| Role | Email | Password |
|---|---|---|
| Admin | admin@roxiler.com | Admin@1234 |
| Normal User | rahul@example.com | Demo@1234 |
| Store Owner | owner.green@example.com | Owner@1234 |

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public (creates a Normal User) |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Any logged-in user |
| POST | /api/auth/change-password | Any logged-in user |
| GET | /api/admin/dashboard | Admin |
| GET, POST | /api/admin/users | Admin |
| GET | /api/admin/users/:id | Admin |
| GET, POST | /api/admin/stores | Admin |
| GET | /api/stores | Normal User |
| POST, PUT | /api/stores/:storeId/ratings | Normal User |
| GET | /api/owner/dashboard | Store Owner |

List endpoints support query parameters: `name`, `email`, `address`, `role` (users only), `sortBy` and `order=asc|desc`. Sort columns are checked against a whitelist.

## Security

- Passwords are hashed with bcrypt and never returned in responses
- JWT authentication; the backend checks the role on every protected route
- A Store Owner can only see data of their own store (the store is found from the token)
- All SQL uses parameterized queries
- Secrets are kept in `.env`, which is not committed

## Screenshots

### Login
![Login](docs/screenshots/login.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Stores (Normal User)
![Stores](docs/screenshots/user-stores.png)

### Store Owner Dashboard
![Owner Dashboard](docs/screenshots/owner-dashboard.png)