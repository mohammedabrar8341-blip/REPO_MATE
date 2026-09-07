# RepoMate - GitHub Repository AI Assistant

A full-stack authentication system for analyzing GitHub repositories using AI. This project is designed to demonstrate a complete authentication workflow with a React frontend and Express.js backend, perfect for college projects and job interviews.

## 🎯 Features

### Backend (Express.js + MongoDB)
- ✅ User Authentication (Signup/Signin with JWT)
- ✅ Password Hashing with bcryptjs
- ✅ JWT Token-based Authorization
- ✅ Protected API Routes
- ✅ GitHub Repository Indexing
- ✅ AI-powered Code Analysis
- ✅ CORS Configuration for Frontend Integration

### Frontend (React + Vite)
- ✅ Beautiful Authentication UI (Signup/Signin)
- ✅ Protected Routes with Route Guards
- ✅ Authentication Context (Global State Management)
- ✅ Home Dashboard for Repository Management
- ✅ User Profile Page
- ✅ Logout Functionality with Cookie Management
- ✅ Responsive Design
- ✅ Error Handling & User Feedback

## 📁 Project Structure

```
REPOMATE/
├── BACKEND_repo/
│   ├── lib/
│   │   ├── Model.js              # Mongoose schemas
│   │   ├── Models.js             # User & Repository models
│   │   ├── db.js                 # Database connection
│   │   ├── Signup.js             # Signup controller
│   │   ├── Sigin.js              # Signin controller
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── indexRepo.js          # Repository indexing logic
│   │   ├── askQuestion.js        # AI query handler
│   │   └── ...other files
│   ├── server.js                 # Express server & routes
│   ├── package.json
│   ├── .env                      # Environment variables
│   └── embedding.json
│
└── FRONTEND/
    └── vite-project/
        ├── src/
        │   ├── Components/
        │   │   ├── Signup.jsx         # Signup page
        │   │   ├── Signin.jsx         # Signin page
        │   │   ├── Home.jsx           # Main dashboard
        │   │   ├── Profile.jsx        # User profile
        │   │   ├── ProtectedRoute.jsx # Route protection
        │   │   ├── Auth.css           # Auth styling
        │   │   ├── Home.css           # Home styling
        │   │   └── Profile.css        # Profile styling
        │   ├── services/
        │   │   └── api.js             # Axios API service
        │   ├── context/
        │   │   └── AuthContext.jsx    # Auth state management
        │   ├── App.jsx                # Main app with routing
        │   ├── main.jsx
        │   └── index.css
        ├── package.json
        └── vite.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (for database)
- Gemini API Keys (for AI features)
- GitHub Personal Access Token (optional, for higher rate limits)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd BACKEND_repo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** - Update `.env` file:
   ```
   MONO_DB=mongodb+srv://your_username:your_password@cluster.mongodb.net/repomate
   JWT_SECRET=your_secret_key_change_this_in_production
   Gemini_API_Key_1=your_gemini_api_key
   Gemini_API_Key_Query_0=your_query_api_key
   GITHUB_ACCESS_TOKEN=your_github_token
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd FRONTEND/vite-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 🔐 Authentication Flow

### Signup Process
1. User fills signup form (username, email, password)
2. Backend validates input and checks if user exists
3. Password is hashed using bcryptjs (salt: 10)
4. User data is stored in MongoDB
5. User is redirected to signin page

### Signin Process
1. User enters email and password
2. Backend finds user by email
3. Password is verified using bcryptjs
4. JWT token is generated (expires in 7 days)
5. Token is returned and stored in localStorage
6. User is logged in and redirected to home page

### Protected Routes
- `/home` - Dashboard for repository indexing and queries
- `/profile` - User profile page
- All protected routes check for valid JWT token
- Automatic redirect to signin if token is invalid/expired

## 📚 API Endpoints

### Public Endpoints

**POST `/api/auth/signup`**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**POST `/api/auth/signin`**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Protected Endpoints (Require JWT Token)

**POST `/api/protected/addRepo`**
```json
{
  "githubURL": "https://github.com/username/repo",
  "gitToken": "optional_github_token"
}
```

**POST `/api/protected/giturl/question`**
```json
{
  "userQuery": "What does the main function do?"
}
```

## 🎨 UI/UX Features

### Authentication Pages
- Gradient backgrounds with modern design
- Input validation with error messages
- Success/error notifications
- Smooth animations and transitions
- Mobile responsive design

### Home Dashboard
- Tab-based interface (Index Repository / Ask Question)
- Real-time form validation
- File listing with summaries
- AI response display
- Repository management

### User Profile
- User information display
- Logout button with confirmation
- Clean, centered card design
- Mobile optimized

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds = 10
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Frontend route guards with AuthContext
- **Token Expiration**: 7-day token validity
- **Secure Cookies**: HttpOnly, SameSite flags (configurable)
- **CORS Configuration**: Restricted to frontend URL
- **Environment Variables**: Sensitive data stored in .env

## 📊 Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Repository Model
```javascript
{
  userId: ObjectId (ref: User),
  githubURL: String,
  repositoryName: String,
  indexedFiles: [
    {
      fileName: String,
      sourceCode: String,
      summary: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Application

1. **Test Signup**
   - Navigate to `http://localhost:5173/signup`
   - Fill in username, email, and password
   - Click "Sign Up"
   - Verify user is created in MongoDB

2. **Test Signin**
   - Navigate to `http://localhost:5173/signin`
   - Enter email and password
   - Click "Sign In"
   - Verify token is stored in localStorage

3. **Test Protected Routes**
   - Try accessing `/home` without login
   - Should redirect to signin page
   - Login first, then access home page

4. **Test Repository Indexing**
   - Add a public GitHub repository URL
   - System should index files and display them

5. **Test Logout**
   - Click logout button
   - Token should be removed from localStorage
   - Should redirect to signin page

## 🛠️ Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables
- **@google/genai** - AI integration
- **@langchain/community** - LLM chains

### Frontend
- **React 19** - UI library
- **React Router v7** - Routing
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling (Flexbox, Grid)

## 📝 Key Implementation Details

### Authentication Context
- Uses React Context API for global state management
- Stores user data and token in localStorage
- Automatically loads user on app startup
- Provides useAuth hook for easy access

### Axios Interceptors
- Automatically adds JWT token to requests
- Handles 401 errors (token expiration)
- Redirects to signin on unauthorized access

### Protected Route Component
- Checks authentication status
- Shows loading state while verifying
- Redirects unauthenticated users

### Error Handling
- User-friendly error messages
- Server-side validation
- Client-side validation
- Toast notifications for user feedback

## 🎓 Why This Project is Great for Interviews

1. **Complete Full-Stack Example**: Shows both backend and frontend skills
2. **Security Implementation**: Demonstrates JWT, password hashing, protected routes
3. **State Management**: Shows React Context API usage
4. **API Design**: RESTful API with proper structure
5. **Error Handling**: Comprehensive error handling on both ends
6. **Database Design**: Proper schema design with relationships
7. **UI/UX**: Professional looking interface
8. **Code Organization**: Well-structured and modular code
9. **Middleware Implementation**: Shows understanding of backend middleware
10. **Real-world Patterns**: Uses industry-standard practices

## 🐛 Troubleshooting

### Backend not connecting to frontend
- Check CORS configuration in server.js
- Ensure frontend URL is whitelisted
- Check if both are running on correct ports

### MongoDB connection fails
- Verify MONO_DB connection string in .env
- Check network access in MongoDB Atlas
- Ensure credentials are correct

### Token not persisting
- Check if localStorage is enabled
- Verify token is being saved correctly
- Check browser console for errors

### Routes redirecting to signin
- Verify JWT_SECRET in backend .env
- Check token expiration time
- Verify token is in localStorage

## 📞 Support & Improvements

Feel free to enhance this project with:
- Email verification on signup
- Password reset functionality
- Rate limiting on API endpoints
- Refresh token mechanism
- User dashboard with stats
- Repository history
- Advanced search filters

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Coding! 🚀**

This project demonstrates professional-level full-stack development and is perfect for showcasing your skills in college projects and job interviews.
