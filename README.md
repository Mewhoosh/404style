# 404Style E-commerce

## Requirements

- Node.js 18+
- MySQL database

## Setup

### 1. Install dependencies

Server:
```bash
cd server
npm install
```

Client:
```bash
cd client
npm install --legacy-peer-deps
```

### 2. Database setup

Start MySQL (XAMPP or standalone). Create database:

```sql
CREATE DATABASE 404style;
```

### 3. Configure environment

Create `server/.env` file:

```env
DATABASE_URL=mysql://root:@localhost:3306/404style
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=change_this_to_random_string
```

Copy from `server/.env.example` for full config with OAuth/Stripe/Email (optional).

### 4. Run application

Terminal 1 (backend):
```bash
cd server
npm run dev
```

Terminal 2 (frontend):
```bash
cd client
npm run dev
```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Make user admin

Register account via frontend, then update in database:

```sql
UPDATE Users SET role='admin' WHERE email='your@email.com';
```
