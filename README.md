# 📚 EasyReads - Online Bookstore Platform

A full-stack web application for browsing, searching, and managing books, e-books, and audiobooks. Built with React, Express.js, MongoDB, and Firebase.

## ✨ Features

### User Features
- 🔐 **Firebase Authentication** - Secure login and signup with email verification
- 📖 **Book Browsing** - Browse books across 7 categories (Fiction, Science, Biography, Fantasy, History, Technology, Romance)
- 📱 **Digital Content** - Access e-books and audiobooks via Google Books API
- 🔍 **Search & Filter** - Find books by category, author, and more
- 💡 **Recommendations** - Personalized book recommendations based on browsing history
- 📝 **Book Requests** - Request books that aren't available in the library
- 🤖 **AI Assistant** - Chat with AI assistant for book recommendations and platform help
- 🎨 **Modern UI** - Beautiful, responsive design with dark theme

### Admin Features
- 🔒 **Admin Dashboard** - Exclusive admin-only access
- 📊 **Book Management** - Full CRUD operations for all 10 book collections
- ✅ **Request Management** - Approve, reject, or manage book requests
- 📈 **Status Tracking** - Track request status (pending, approved, rejected)

## 🏗️ Project Structure

```
EasyReads/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components (Home, Books, DigitalBooks, Requests, Admin)
│   │   ├── components/      # Reusable components (Navbar, Footer, BookCard, AIAssistant, etc.)
│   │   ├── contexts/        # React contexts (AuthContext)
│   │   ├── config/          # Configuration (Firebase)
│   │   └── utils/           # Utility functions (admin check)
│   └── package.json
│
├── backend/                  # Express.js backend API
│   ├── Model/               # MongoDB schemas (10 book collections + BookRequest)
│   ├── routes/               # API routes
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware (auth, connection)
│   └── server.js            # Express server
│
├── database_diagram.dbml    # Database schema diagram
├── class_diagram.puml       # Class diagram
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Option 1: Docker (Recommended)** - Docker Desktop installed
- **Option 2: Manual Setup** - Node.js (v16+), MongoDB, Firebase account

### 🐳 Quick Start with Docker (Recommended)

**Perfect for beginners!** Docker handles everything automatically.

1. **Install Docker Desktop**
   - Download from https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Clone the repository**
```bash
git clone https://github.com/JatinMGulati/EasyReadss.git
cd EasyReads
```

3. **Create environment file**
```bash
# Create .env file in root directory
cat > .env << EOF
# Frontend Environment Variables
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GOOGLE_API_KEY=your_google_books_api_key

# Backend Environment Variables
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
OPENAI_API_KEY=your_openai_api_key
EOF
```

4. **Fill in your actual values in `.env` file**

5. **Start everything with Docker**
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27017

**That's it!** Everything is running. See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed Docker instructions.

**Useful Docker Commands:**
```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart a service
docker-compose restart frontend
docker-compose restart backend
```

### 📦 Manual Installation (Without Docker)

1. **Clone the repository**
```bash
git clone https://github.com/JatinMGulati/EasyReadss.git
cd EasyReads
```

2. **Install dependencies**
```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

3. **Setup environment variables**

**Frontend** (`frontend/.env`):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GOOGLE_API_KEY=your_google_books_api_key
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/easyreads
NODE_ENV=development
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
OPENAI_API_KEY=your_openai_api_key
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Start the application**
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

Visit `http://localhost:5173` (or your Vite port)

## 📚 API Endpoints

### Book Collections (10 collections with full CRUD)
Each collection supports: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

- `/api/books` - Physical books
- `/api/ebooks` - E-books
- `/api/audiobooks` - Audiobooks
- `/api/fiction` - Fiction books
- `/api/science` - Science books
- `/api/biography` - Biography books
- `/api/fantasy` - Fantasy books
- `/api/history` - History books
- `/api/technology` - Technology books
- `/api/romance` - Romance books

### Book Requests
- `GET /api/book-requests` - Get all requests (admin) or filtered by status
- `GET /api/book-requests/:id` - Get request by ID
- `GET /api/book-requests/user/:uid` - Get user's requests
- `POST /api/book-requests` - Create new request
- `PATCH /api/book-requests/:id/status` - Update request status (admin)
- `DELETE /api/book-requests/:id` - Delete request

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant

### Authentication
- `GET /api/auth/verify` - Verify Firebase token
- `GET /api/auth/user` - Get user info

### Admin
- `GET /api/admin/users` - Get all Firebase users (admin only)

## 🗄️ Database Schema

### Collections

1. **books** - Physical books with Amazon links
2. **ebooks** - Digital e-books
3. **audiobooks** - Audiobooks with narrator field
4. **fictionbooks** - Fiction category
5. **sciencebooks** - Science category
6. **biographybooks** - Biography category
7. **fantasybooks** - Fantasy category
8. **historybooks** - History category
9. **technologybooks** - Technology category
10. **romancebooks** - Romance category
11. **bookrequests** - User book requests with status tracking

### Relationships

- **One-to-One**: books ↔ ebooks, books ↔ audiobooks (via ISBN)
- **One-to-Many**: books → category collections (via ISBN)
- **Many-to-One**: bookrequests → books (via ISBN when approved)

See `database_diagram.dbml` for complete schema details.

## 🔐 Authentication & Authorization

### User Roles

1. **Regular Users**
   - Can access: Home, Books, Digital Books, Requests
   - Cannot access: Admin dashboard
   - Can create book requests
   - Email verification required

2. **Admin Users**
   - Can ONLY access: Admin dashboard
   - Automatically redirected from all other pages
   - Can manage books and requests

### Admin Configuration

Admin users are defined in `frontend/src/utils/admin.js`. Add admin emails to the list:

```javascript
const ADMIN_EMAILS = [
  'admin@easyreads.com',
  'your-admin-email@example.com'
];
```

### Email Verification

- Users receive verification email after signup
- Users must verify email before logging in
- Verification email is automatically sent if user tries to login without verification

## 🎨 Frontend Pages

- **Home** (`/home`) - Welcome page with categories, recommendations, and book sections
- **Books** (`/books`) - Browse books by category
- **Digital Books** (`/digital-books`) - E-books and audiobooks from Google Books API
- **Requests** (`/requests`) - Submit and view book requests
- **Admin** (`/admin`) - Admin dashboard (admin only)
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - User registration

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Firebase Auth** - Authentication
- **Google Books API** - Digital content

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Firebase Admin SDK** - Admin operations
- **OpenAI API** - AI assistant (optional)

## 📝 Available Scripts

### Root Level
```bash
npm run install:all      # Install all dependencies
npm run dev:frontend     # Start frontend dev server
npm run dev:backend      # Start backend server
npm run build:frontend   # Build frontend for production
npm run start:backend    # Start backend in production
```

### Frontend
```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Backend
```bash
cd backend
npm start                # Start server
npm run dev              # Start with nodemon (if configured)
```

## 🧪 Testing

### API Testing
Use Postman or curl to test endpoints:

```bash
# Get all books
curl http://localhost:5000/api/books

# Create a book request
curl -X POST http://localhost:5000/api/book-requests \
  -H "Content-Type: application/json" \
  -d '{
    "bookName": "New Book",
    "author": "Author Name",
    "requestedBy": "user@example.com",
    "requestedByUid": "firebase-uid"
  }'

# Chat with AI assistant
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What books do you recommend?"}'
```

## 📊 Features Overview

### Book Management
- ✅ 10 book collections with full CRUD
- ✅ Category-based organization
- ✅ ISBN-based relationships
- ✅ Image and Amazon link support
- ✅ Preview buttons for all books

### Book Requests
- ✅ User can request unavailable books
- ✅ Status tracking (pending, approved, rejected)
- ✅ Admin approval workflow
- ✅ Request history per user

### Admin Dashboard
- ✅ Book CRUD operations for all collections
- ✅ Request management with status updates
- ✅ Collection selector for different book types
- ✅ Filter requests by status

### User Experience
- ✅ Personalized recommendations
- ✅ Category browsing
- ✅ Google Books integration
- ✅ AI assistant for help and recommendations
- ✅ Responsive design
- ✅ Dark theme UI
- ✅ Email verification

## 🔒 Security Features

- Firebase Authentication
- Email verification
- Admin-only route protection
- Token verification middleware
- Input validation
- CORS configuration

## 🚀 Vercel Deployment

### Frontend Deployment

The project includes `vercel.json` configuration for easy deployment on Vercel.

**Deployment Steps:**

1. **Connect Repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - **Root Directory:** `frontend` (or leave empty if using root `vercel.json`)
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Add Environment Variables:**
   Add all `VITE_*` variables in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   VITE_FIREBASE_API_KEY=your-firebase-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_GOOGLE_API_KEY=your-google-api-key
   VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

**Note:** The `vercel.json` file includes SPA routing configuration to handle React Router routes correctly.

## 📚 Documentation

- **Docker Guide**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Complete Docker setup and usage guide
- **Docker Commands**: [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) - Quick reference for Docker commands
- **Database Diagram**: `database_diagram.dbml` (view on dbdiagram.io)
- **Class Diagram**: `class_diagram.puml` (view with PlantUML)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Books API for digital content
- Firebase for authentication
- MongoDB for database
- OpenAI for AI assistant capabilities

---

**Built with ❤️ for book lovers everywhere**
