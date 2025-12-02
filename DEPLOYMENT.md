# Production Deployment Guide

## Prerequisites
- MongoDB Atlas account (for database)
- Render/Railway account (for backend)
- Netlify/Vercel account (for frontend)
- Gmail account with app password (for emails)

## Step 1: Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for production)
5. Get connection string

## Step 2: Backend Deployment (Render)

1. **Create Web Service**
   - Connect GitHub repository
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pgmanagement
   JWT_SECRET=your_super_secure_jwt_secret_key
   CORS_ORIGIN=https://your-frontend-domain.netlify.app
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=5000
   ```

3. **Deploy and get backend URL**

## Step 3: Frontend Deployment (Netlify)

1. **Create New Site**
   - Connect GitHub repository
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-service.onrender.com
   ```

3. **Deploy and get frontend URL**

## Step 4: Update CORS Origin

Update backend environment variable:
```
CORS_ORIGIN=https://your-frontend-domain.netlify.app
```

## Step 5: Email Configuration

1. Enable 2-factor authentication on Gmail
2. Generate app password
3. Use app password in EMAIL_PASS environment variable

## Step 6: Testing

1. Test user registration/login
2. Test property creation
3. Test payment system
4. Test email notifications
5. Test PDF generation

## Alternative Deployment Options

### Backend Alternatives
- **Railway**: Similar to Render
- **Heroku**: Classic PaaS option
- **DigitalOcean App Platform**: Good performance
- **AWS Elastic Beanstalk**: Enterprise option

### Frontend Alternatives
- **Vercel**: Excellent for React apps
- **GitHub Pages**: Free static hosting
- **Firebase Hosting**: Google's hosting service
- **AWS S3 + CloudFront**: Enterprise option

## Environment-Specific Configurations

### Development
```bash
# Client
VITE_API_URL=http://localhost:5000

# Server
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pgmanagement
CORS_ORIGIN=http://localhost:5173
```

### Production
```bash
# Client
VITE_API_URL=https://your-backend.onrender.com

# Server
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pgmanagement
CORS_ORIGIN=https://your-frontend.netlify.app
```

## Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB connection secured
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Email credentials secured
- [ ] HTTPS enabled on both frontend and backend
- [ ] Input validation implemented
- [ ] Rate limiting configured

## Monitoring and Maintenance

1. **Error Monitoring**: Set up error tracking (Sentry)
2. **Performance**: Monitor API response times
3. **Database**: Monitor MongoDB Atlas metrics
4. **Backups**: Set up automated database backups
5. **Updates**: Keep dependencies updated