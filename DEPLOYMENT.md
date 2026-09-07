# Deployment Guide - RepoMate

This guide covers how to deploy your RepoMate application to production environments.

---

## 🌐 Backend Deployment (Express.js)

### Option 1: Deploy to Heroku (Simple & Free)

**Step 1: Prepare for Deployment**
```bash
cd BACKEND_repo

# Remove node_modules and install production dependencies only
rm -rf node_modules
npm install --production
```

**Step 2: Create Procfile**
Create a file named `Procfile` in BACKEND_repo:
```
web: node server.js
```

**Step 3: Update .env for Production**
```env
MONO_DB=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/repomate_prod
JWT_SECRET=your_super_secure_random_key_production_only
NODE_ENV=production
```

**Step 4: Login to Heroku**
```bash
npm install -g heroku
heroku login
```

**Step 5: Create and Deploy**
```bash
heroku create your-app-name-backend
git push heroku main
heroku logs --tail
```

**Step 6: Set Environment Variables**
```bash
heroku config:set MONO_DB="your_connection_string"
heroku config:set JWT_SECRET="your_secret_key"
```

---

### Option 2: Deploy to Railway (Modern Alternative)

**Step 1: Sign up at railway.app**

**Step 2: Connect GitHub Repository**
- Link your repo
- Railway auto-detects Node.js

**Step 3: Set Environment Variables**
In Railway dashboard → Variables:
- Add all keys from `.env`

**Step 4: Deploy**
- Auto-deploys on git push

---

### Option 3: Deploy to AWS EC2

**Step 1: Create EC2 Instance**
- Ubuntu 22.04 LTS
- t2.micro (free tier)

**Step 2: SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

**Step 3: Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 4: Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

**Step 5: Deploy Application**
```bash
git clone your-repo-url
cd BACKEND_repo
npm install --production
pm2 start server.js --name "repomate-api"
pm2 startup
pm2 save
```

**Step 6: Setup Nginx as Reverse Proxy**
```bash
sudo apt-get install nginx
sudo systemctl start nginx
```

Edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎨 Frontend Deployment (React + Vite)

### Option 1: Deploy to Vercel (Recommended)

**Step 1: Build Project**
```bash
cd FRONTEND/vite-project
npm run build
```

**Step 2: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 3: Deploy**
```bash
vercel
```

**Step 4: Set Environment Variables**
In Vercel Dashboard:
```
VITE_API_URL=https://your-backend-domain.com/api
```

**Step 5: Update API Service**
In `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
```

---

### Option 2: Deploy to Netlify

**Step 1: Build Project**
```bash
npm run build
```

**Step 2: Create netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 3: Connect GitHub**
- Go to netlify.com
- Connect your GitHub repo
- Netlify auto-deploys on push

**Step 4: Set Environment Variables**
In Netlify Dashboard → Environment:
```
VITE_API_URL=https://your-backend-domain.com/api
```

---

### Option 3: Deploy to AWS S3 + CloudFront

**Step 1: Build**
```bash
npm run build
```

**Step 2: Create S3 Bucket**
```bash
aws s3 mb s3://your-bucket-name
```

**Step 3: Upload Build Files**
```bash
aws s3 sync dist/ s3://your-bucket-name
```

**Step 4: Enable CloudFront CDN**
- Faster global access
- Automatic caching
- SSL support

---

## 🔒 Production Security Checklist

### Backend Security
- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL certificate
- [ ] Restrict CORS to only your frontend domain
- [ ] Use environment-specific database (separate prod DB)
- [ ] Enable rate limiting on API endpoints
- [ ] Set HTTP headers (helmet.js)
- [ ] Use HTTPS for all connections
- [ ] Implement request validation
- [ ] Add API authentication keys
- [ ] Enable logging and monitoring

### Frontend Security
- [ ] Build with optimizations enabled
- [ ] Remove debug code and console logs
- [ ] Enable CSP headers
- [ ] Use security headers
- [ ] Implement subresource integrity
- [ ] Regular dependency updates
- [ ] Remove sensitive data from code
- [ ] Enable HTTPS only
- [ ] Use secure cookies

### Database Security
- [ ] Use connection string with strong password
- [ ] Enable IP whitelisting in MongoDB Atlas
- [ ] Use separate credentials for prod
- [ ] Enable encryption at rest
- [ ] Regular backups enabled
- [ ] Monitor for suspicious access

---

## 📊 Monitoring & Logging

### Add Logging to Backend
```javascript
// server.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Use Monitoring Services
- **Sentry.io**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Performance monitoring
- **New Relic**: APM monitoring

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] Security review completed
- [ ] Performance optimized
- [ ] Backup plan in place

### After Deployment
- [ ] Test all features in production
- [ ] Verify SSL certificate works
- [ ] Check API endpoints respond correctly
- [ ] Monitor error logs
- [ ] Test signup/signin flow
- [ ] Verify database persistence
- [ ] Check performance metrics
- [ ] Setup alerts for errors

---

## 💰 Cost Estimates (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| MongoDB Atlas | Free/Shared | $0-$57 |
| Heroku | Eco | $5 |
| Vercel | Pro | $20 |
| AWS EC2 | t2.micro | $0-10 |
| Railway | Free | $0 |
| Netlify | Free | $0 |

**Best Budget Option**: Railway or Heroku + Vercel (~$5/month)

---

## 🔄 Continuous Deployment (CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          cd BACKEND_repo
          npm install
          git push heroku main
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      
      - name: Deploy Frontend
        run: |
          cd FRONTEND/vite-project
          npm install
          npm run build
          vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🎓 Interview Answer: "How Would You Deploy This?"

**Answer Template:**
"I would deploy the backend to Heroku or Railway for simplicity, since it handles Node.js applications well and has built-in environment variable management. For the frontend, I'd use Vercel or Netlify since they're optimized for React applications and automatically optimize builds.

For production, I'd:
1. Separate prod database from dev
2. Use strong JWT_SECRET
3. Enable HTTPS/SSL
4. Implement rate limiting
5. Add error monitoring with Sentry
6. Use CDN for static assets
7. Setup automated tests in CI/CD
8. Configure health checks and alerts
9. Plan regular backups
10. Document the deployment process

This ensures the application is secure, scalable, and maintainable."

---

## 📞 Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Environment variables not loading | Verify variables in hosting dashboard |
| CORS errors in production | Update CORS origin to production frontend URL |
| Database connection fails | Check MongoDB Atlas network access settings |
| Frontend can't reach backend | Verify backend URL in production config |
| SSL certificate issues | Use certbot for Let's Encrypt free SSL |
| Build fails | Check npm versions, dependencies conflicts |

---

**Your application is now production-ready! 🚀**
