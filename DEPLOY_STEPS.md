# Quick Deployment Steps for Render

## 🚀 Fast Track Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Go to Render Dashboard
Visit: https://dashboard.render.com

### 3. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect GitHub and select **GeoPulse** repository

### 4. Configure Service

**Basic Settings:**
- Name: `geopulse-backend`
- Environment: `Node`
- Branch: `main`

**🔴 CRITICAL Settings:**
- **Root Directory**: `server` ← **MUST SET THIS!**
- Build Command: `npm install`
- Start Command: `npm start`

### 5. Add Environment Variables

Click "Advanced" → Add these variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://jerickogarcia0_db_user:KxDl56V6wYZM3wt9@geopulse.p5hbbla.mongodb.net/geopulse?retryWrites=true&w=majority
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING
JWT_EXPIRE=7d
IMAGEKIT_PUBLIC_KEY=public_VWMrlSx4wBDKYGNfGUdq+rxg3Mw=
IMAGEKIT_PRIVATE_KEY=private_0LfHHAZv9MWnoQR7zU8if4wSDAY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/protechworks/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jerickogarcia0@gmail.com
SMTP_PASS=jlda vyjh aefm lobw
CLIENT_URL=https://your-frontend-app.vercel.app
```

⚠️ **Important**: 
- Generate new `JWT_SECRET` (use: https://www.lastpass.com/features/password-generator)
- Replace `CLIENT_URL` with your actual frontend URL

### 6. Deploy
Click **"Create Web Service"** and wait 2-3 minutes

### 7. Test Your Deployment

Open in browser:
```
https://your-service-name.onrender.com/api/health
```

Should return:
```json
{"status":"OK","message":"GeoPulse API is running"}
```

### 8. Update Frontend

In Vercel (or your frontend host), add environment variable:
```
VITE_API_URL=https://your-service-name.onrender.com/api
```

---

## ✅ Check List

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Root directory set to `server`
- [ ] All environment variables added
- [ ] New JWT_SECRET generated
- [ ] CLIENT_URL updated
- [ ] Health endpoint working
- [ ] Frontend updated with new API URL

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Build fails | Check Root Directory is set to `server` |
| Can't connect to MongoDB | Verify MONGODB_URI and Atlas IP whitelist |
| CORS errors | Update CLIENT_URL in backend environment variables |
| Service sleeps | This is normal on free tier - consider upgrading |

## 📚 Full Guide

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions

## 💰 Pricing

- **Free**: $0/month (sleeps after 15 min)
- **Starter**: $7/month (always running)

Choose based on your needs!

