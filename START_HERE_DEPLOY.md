# 🚀 Start Here: Deploy GeoPulse Backend to Render

## Quick Navigation

1. 📋 **[Pre-Deployment Checklist](./.pre-deployment-checklist.md)** - Read this FIRST
2. ⚡ **[Quick Deploy Guide](./DEPLOY_STEPS.md)** - Fast track deployment (5 minutes)
3. 📖 **[Full Deployment Guide](./RENDER_DEPLOYMENT.md)** - Comprehensive details

---

## What Changed?

Your backend is now **production-ready** for Render:

✅ Fixed MongoDB connection (removed deprecated options)  
✅ Created deployment guides and checklists  
✅ Added Render configuration file  
✅ Updated README with deployment instructions  
✅ Created security checklist  

---

## Immediate Next Steps

### 1. Read the Checklist
Open [.pre-deployment-checklist.md](./.pre-deployment-checklist.md) and complete all items

### 2. Generate JWT Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OR** use: https://www.lastpass.com/features/password-generator (generate 64 chars)

Copy the generated secret - you'll need it for Render!

### 3. Follow Deployment Steps

Open [DEPLOY_STEPS.md](./DEPLOY_STEPS.md) and follow the 8 steps

**TL;DR:**
1. Push code to GitHub
2. Create Web Service in Render
3. Set Root Directory = `server`
4. Add environment variables
5. Deploy

---

## Important Notes

### ⚠️ Critical Settings in Render

When creating the service, **MUST SET**:
- **Root Directory**: `server` (because your backend is in the server folder)

### 🔒 Environment Variables to Add

You'll add these in Render dashboard (NOT committed to code):

| Variable | What to Do |
|----------|-----------|
| `JWT_SECRET` | Generate new random string |
| `MONGODB_URI` | Use existing Atlas connection |
| `CLIENT_URL` | Set to your frontend URL |
| All others | Copy from `.env` file |

### 💰 Free vs Paid

**Free Tier ($0/month):**
- ⚠️ Sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Good for testing/demos

**Starter ($7/month):**
- Always running
- Better performance
- Recommended for production

---

## Need Help?

### Check Logs
If something fails, check Render Dashboard → Your Service → Logs

### Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Build fails | Root directory MUST be `server` |
| Can't connect MongoDB | Check MONGODB_URI and Atlas IP whitelist |
| CORS errors | Update CLIENT_URL env variable |
| "Route not found" | Add `/api` prefix to URLs |

### Resources

- Full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Render docs: https://render.com/docs
- Support: https://community.render.com

---

## Success Indicators

✅ Health endpoint works: `https://your-url.onrender.com/api/health`  
✅ Returns: `{"status":"OK","message":"GeoPulse API is running"}`  
✅ MongoDB connected (check logs)  
✅ No errors in Render logs  
✅ Frontend can communicate with backend  

---

## Next: Update Frontend

After backend is deployed:

1. Get your Render URL: `https://your-service.onrender.com`
2. Update frontend environment variable:
   - In Vercel: Add `VITE_API_URL=https://your-service.onrender.com/api`
3. Redeploy frontend
4. Test the full app!

---

**Ready? Go to [DEPLOY_STEPS.md](./DEPLOY_STEPS.md) and start deploying! 🎉**

