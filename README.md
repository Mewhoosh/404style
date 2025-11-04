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

**WAŻNE: Musisz zainstalować wszystkie zależności w folderze `server/`**

```powershell
cd server
npm install
```

Wymagane pakiety (instalowane automatycznie przez `npm install`):
- `express` - Web framework
- `sequelize` + `mysql2` - ORM i driver bazy danych
- `bcryptjs` - Hashowanie haseł
- `jsonwebtoken` - Tokeny JWT dla autoryzacji
- `passport` + `passport-google-oauth20` + `passport-github2` - OAuth (Google/GitHub)
- `multer` + `sharp` - Upload i przetwarzanie obrazów
- `stripe` - Płatności
- `nodemailer` - Wysyłanie emaili
- `dotenv` - Zmienne środowiskowe
- `cors` - CORS middleware
- `express-session` - Sesje

Dev dependencies:
- `nodemon` - Auto-restart serwera podczas developmentu

**Utwórz plik `.env` w folderze `server/`:**

```env
# Server
PORT=5000

# Database (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=404style

# JWT Secret (ZMIEŃ w produkcji!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
CLIENT_URL=http://localhost:5173

# Google OAuth (opcjonalne - tylko jeśli używasz logowania przez Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (opcjonalne - tylko jeśli używasz logowania przez GitHub)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe Payment (WYMAGANE dla płatności)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Service (WYMAGANE dla powiadomień email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=404Style <your-email@gmail.com>
```

**⚠️ UWAGA:**
- Jeśli nie masz kluczy Stripe, zarejestruj się na https://stripe.com i utwórz testowe klucze
- Dla Gmail użyj "App Password" zamiast zwykłego hasła (2FA musi być włączone)

### 3. Database

Start MySQL (XAMPP or standalone), then create database:

```sql
CREATE DATABASE 404style CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 4. Frontend setup

**WAŻNE: Musisz zainstalować wszystkie zależności w folderze `client/` z flagą `--legacy-peer-deps`**

```powershell
cd ..\client
npm install --legacy-peer-deps
```

**Dlaczego `--legacy-peer-deps`?**
Projekt używa React 19, ale niektóre pakiety (jak `react-quill`) jeszcze nie wspierają oficjalnie React 19. Flaga `--legacy-peer-deps` pozwala zainstalować pakiety mimo konfliktów wersji peer dependencies.

Wymagane pakiety (instalowane automatycznie):
- `react` + `react-dom` - React framework
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching i cache
- `axios` - HTTP client
- `react-quill` - Rich text editor
- `@dnd-kit/core` + `@dnd-kit/sortable` - Drag & drop
- `lucide-react` - Ikony
- `tailwindcss` - CSS framework
- `vite` - Build tool

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
