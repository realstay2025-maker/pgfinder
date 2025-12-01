# Deployment Guide for Render

## Backend Deployment

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=5000
   ```

## Frontend Deployment

1. **Create a new Static Site on Render**
   - Connect your GitHub repository
   - Set Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   Add this environment variable:
   ```
   VITE_API_URL=https://your-backend-service-url.onrender.com
   ```

## Important Notes

- Replace `https://your-backend-service-url.onrender.com` with your actual backend URL
- Make sure MongoDB Atlas is configured to allow connections from anywhere (0.0.0.0/0)
- The backend service will be available at: `https://your-service-name.onrender.com`
- The frontend will be available at: `https://your-frontend-name.onrender.com`

## Local Development

For local development, create a `.env.local` file in the client directory:
```
VITE_API_URL=http://localhost:5000
```