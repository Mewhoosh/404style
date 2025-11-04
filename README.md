# 404Style - E-commerce Application

## Requirements

- Node.js 18+ (https://nodejs.org)
- MySQL 8.0+
- Git

Check versions:
```bash
node --version
npm --version
```

## Installation

### 1. Clone repository

```bash
git clone https://github.com/mewhoosh/404style.git
cd 404style
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `.env` file in `server/` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=404style
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Database

Start MySQL (XAMPP or standalone), then create database:

```sql
CREATE DATABASE 404style CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 4. Frontend setup

```bash
cd ../client
npm install --legacy-peer-deps
```

### 5. Run seeds (optional)

```bash
cd ../server
node seedUsers.js
node seedCategories.js
node seedProducts.js
node seedDefaultTheme.js
```

### 6. Start application

Backend (terminal 1):
```bash
cd server
npm run dev
```

Frontend (terminal 2):
```bash
cd client
npm run dev
```

## Access

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Default credentials

After running seeds:
- Admin: `admin@404style.com` / `admin123`
- Moderator: `moderator@404style.com` / `moderator123`
- User: `user@404style.com` / `user123`
