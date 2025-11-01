# Deploying GeoPulse Backend to Render

This guide will walk you through deploying your GeoPulse backend to Render.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com))
- Your GitHub repository pushed and accessible
- MongoDB database (already configured: Atlas)
- ImageKit account (already configured)
- Gmail app password (already configured)

## Step 1: Connect Your Repository to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect your GitHub account if not already connected
5. Select your **GeoPulse** repository

## Step 2: Configure the Web Service

Fill in the following details:

### Basic Settings:
- **Name**: `geopulse-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., `Frankfurt`, `Ohio`, etc.)
- **Branch**: `main` or `master` (your default branch)

### Build & Deploy Settings:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

⚠️ **Important**: Make sure to set the **Root Directory** to `server` since your backend code is in the `server` folder!

### Environment Variables:

Add the following environment variables in the Render dashboard:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Set automatically |
| `PORT` | `5000` | Render will auto-assign, but set just in case |
| `MONGODB_URI` | `mongodb+srv://jerickogarcia0_db_user:KxDl56V6wYZM3wt9@geopulse.p5hbbla.mongodb.net/geopulse?retryWrites=true&w=majority` | Your MongoDB connection |
| `JWT_SECRET` | `[Generate a strong random secret]` | **Create a new strong secret!** |
| `JWT_EXPIRE` | `7d` | |
| `IMAGEKIT_PUBLIC_KEY` | `public_VWMrlSx4wBDKYGNfGUdq+rxg3Mw=` | Your ImageKit key |
| `IMAGEKIT_PRIVATE_KEY` | `private_0LfHHAZv9MWnoQR7zU8if4wSDAY=` | Your ImageKit key |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/protechworks/` | Your ImageKit endpoint |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | `jerickogarcia0@gmail.com` | |
| `SMTP_PASS` | `jlda vyjh aefm lobw` | |
| `CLIENT_URL` | `https://your-frontend-url.vercel.app` | **Replace with your actual frontend URL** |

⚠️ **SECURITY WARNING**: 
- Generate a strong `JWT_SECRET` for production (you can use: `openssl rand -hex 32`)
- The `SMTP_PASS` shown is your Gmail app password - keep it secure!
- Update `CLIENT_URL` to match your deployed frontend URL

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your service
3. Wait for the build to complete (usually 2-3 minutes)
4. Once deployed, you'll get a URL like: `https://geopulse-backend.onrender.com`

## Step 4: Verify Deployment

1. Test the health endpoint:
   ```
   https://your-service-url.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"GeoPulse API is running"}`

2. Check the logs in Render dashboard to ensure:
   - MongoDB connected successfully
   - Server started on the correct port
   - No errors occurred

## Step 5: Update Frontend API URL

After deployment, update your frontend to point to the new backend URL:

1. Open `client/.env` or environment variables in your frontend host (Vercel)
2. Update `VITE_API_URL` to: `https://your-service-url.onrender.com`
3. Redeploy your frontend

## Important Notes

### Auto-Deploy:
- Render automatically deploys when you push to your connected branch
- You can disable this in Settings if needed

### Free Tier Limitations:
- Render free tier services **sleep after 15 minutes of inactivity**
- First request after sleep takes **30-60 seconds** to wake up
- Consider upgrading for production apps

### Persistence:
- Your database (MongoDB Atlas) persists data
- Make sure your Atlas database allows connections from anywhere (0.0.0.0/0) in IP whitelist

### Environment Variables:
- All sensitive data should be in Render's environment variables, NOT in code
- The `.env` file is already in `.gitignore` for security

## Troubleshooting

### Build Fails:
- Check that **Root Directory** is set to `server`
- Verify `package.json` exists in the `server` directory
- Check build logs for specific errors

### Connection Issues:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure CORS settings allow your frontend URL

### Service Crashes:
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Test the API endpoints individually

## Cost Estimate

**Free Tier**: $0/month
- 750 hours/month
- Sleeps after 15 min inactivity
- Persistent disk: 512MB

**Starter**: $7/month (recommended for production)
- Always running
- Better performance
- No sleep timeouts

## Support

For issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Render docs: [render.com/docs](https://render.com/docs)
3. Community: [community.render.com](https://community.render.com)

