https://nodejs.org
# 1. Install

https://nodejs.org

node --version
npm --version
npm install sharp
npm install react-beautiful-dnd
npm install lucide-react
npm install react-beautiful-dnd
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --legacy-peer-deps

git clone https://github.com/mewhoosh/404style.git
cd 404style



# 2. Setup Backend
cd server
npm install

# 3.Create .env file in server/ folder:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=404style
JWT_SECRET=your-super-secret-jwt-key-change-this

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

CLIENT_URL=http://localhost:5173


# 4. Database
    # Run Mysql ,Apache 
CREATE DATABASE 404style CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 6. Start backend
npm run dev

# 7. Setup Frontend


cd ../client
npm install
npm run dev


 Dostęp

    Frontend: http://localhost:3000

    Backend: http://localhost:5000

    API Docs: http://localhost:5000/api
