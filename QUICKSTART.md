# QuickStart Guide - RepoMate

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup
```bash
cd BACKEND_repo
npm install
npm start
```
✅ Backend running on http://localhost:8080

### Step 2: Frontend Setup (in new terminal)
```bash
cd FRONTEND/vite-project
npm install
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 3: Test the Application

#### A. Sign Up
- Go to http://localhost:5173/signup
- Enter: username, email, password
- Click "Sign Up"
- ✅ You'll be redirected to Signin page

#### B. Sign In
- Go to http://localhost:5173/signin
- Enter your email and password
- Click "Sign In"
- ✅ You'll be logged in and see the Home dashboard

#### C. Test Protected Routes
- Try accessing http://localhost:5173/home directly
- Try accessing http://localhost:5173/profile
- ✅ Both should work now that you're logged in

#### D. Test Repository Indexing
- Paste a GitHub URL (e.g., https://github.com/username/repo)
- Click "Index Repository"
- ✅ Files should appear below

#### E. Test Logout
- Click "Logout" button
- ✅ You'll be logged out and redirected to signin

---

## 📋 Required Environment Variables

**Backend `.env` file must have:**
```
MONO_DB=mongodb+srv://your_user:your_pass@cluster.mongodb.net/repomate
JWT_SECRET=any_secret_key_here
Gemini_API_Key_1=your_gemini_key
NODE_ENV=development
```

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Can access http://localhost:5173/signup
- [ ] Can create new user account
- [ ] Can login with new account
- [ ] Can access protected routes
- [ ] Logout removes token and redirects

---

## 🆘 Common Issues

**"Cannot connect to MongoDB"**
- Check MONO_DB connection string in .env
- Verify network access in MongoDB Atlas

**"Token verification failed"**
- Check JWT_SECRET is set in .env
- Clear localStorage and login again

**"CORS error"**
- Backend server.js should have cors() configured
- Check port 8080 is accessible from 5173

**"Port already in use"**
- Change port in `server.js` or kill process using port
- For Vite: port is in `vite.config.js`

---

## 📚 Project Files Overview

```
/BACKEND_repo/
  ✅ server.js - Express app with auth routes
  ✅ lib/Signup.js - Register user
  ✅ lib/Sigin.js - Login user
  ✅ lib/authMiddleware.js - JWT check
  ✅ lib/Models.js - User schema
  ✅ lib/db.js - MongoDB connection

/FRONTEND/vite-project/src/
  ✅ App.jsx - Routes & Auth setup
  ✅ Components/Signup.jsx - Register form
  ✅ Components/Signin.jsx - Login form
  ✅ Components/Home.jsx - Dashboard
  ✅ Components/Profile.jsx - User page
  ✅ services/api.js - API calls
  ✅ context/AuthContext.jsx - State
```

---

## 🎯 Next Steps for Your Project

1. **Database Integration** ✅ Already set up
2. **API Endpoints** ✅ Already created
3. **Frontend Pages** ✅ All created
4. **Authentication Flow** ✅ Fully implemented
5. **Styling** ✅ Professional UI included

---

## 🎓 For College Presentation

### What to Highlight
1. **Security**: JWT tokens, password hashing, protected routes
2. **Architecture**: Clear separation of concerns
3. **Frontend**: React state management, routing, responsive design
4. **Backend**: Express middleware, MongoDB integration
5. **Real-world Practices**: Environment variables, error handling

### Live Demo
1. Show signup page
2. Create new account
3. Login to see dashboard
4. Show profile page
5. Click logout
6. Try accessing home (redirects to signin)

---

## 💼 For Job Interviews

### Key Points to Mention
- "I built a full-stack auth system using React and Express"
- "Implemented JWT tokens with 7-day expiration"
- "Used MongoDB for data persistence"
- "Protected API routes with middleware"
- "Implemented React Context for state management"
- "Added proper error handling and validation"
- "Made it responsive and production-ready"

### Code to Explain
- How JWT works in `authMiddleware.js`
- How context works in `AuthContext.jsx`
- How protected routes work in `ProtectedRoute.jsx`
- How axios interceptors work in `api.js`

---

**Ready to present? You've got this! 🚀**
