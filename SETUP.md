# GeoPulse - Complete Setup Guide

## Prerequisites Setup

Before running the application, you need to set up several services:

### 1. MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (choose free tier)
4. Create a database user with username and password
5. Add your IP address to the network whitelist (for development, use 0.0.0.0/0)
6. Click "Connect" → "Connect your application" → Copy the connection string
7. Replace `<password>` with your actual password

Your connection string will look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/geopulse?retryWrites=true&w=majority
```

### 2. ImageKit.io

1. Go to [ImageKit.io](https://imagekit.io)
2. Sign up for a free account
3. Create a new media library
4. Go to Settings → Developer Options
5. Copy your Public Key, Private Key, and URL Endpoint

### 3. SMTP Configuration (Gmail Example)

For Gmail SMTP:

1. Go to your Google Account settings
2. Security → 2-Step Verification → Enable it if not already
3. Search for "App passwords"
4. Create an app password for "Mail"
5. Copy the 16-character password

Alternative: Use [SendGrid](https://sendgrid.com) or any other SMTP service

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd GeoPulse

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Return to root
cd ..
```

### Step 2: Configure Environment Variables

**Server Configuration** (`server/.env`):

Create `server/.env` from `server/.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB (from step 1)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/geopulse?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# ImageKit (from step 2)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# SMTP (from step 3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Client Configuration** (`client/.env`):

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start Development Servers

From the root directory:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 4: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Creating Your First User

1. Open http://localhost:5173
2. Click "Sign up"
3. Fill in the registration form
4. After registration, you'll be logged in automatically

## Setting Up Admin Account

By default, new users are created as "citizen" role. To create an admin:

**Option 1: Through MongoDB Atlas**

1. Go to your MongoDB Atlas cluster
2. Click "Collections"
3. Find the `geopulse` database → `users` collection
4. Find your user document
5. Change the `role` field from `"citizen"` to `"admin"`

**Option 2: Through MongoDB Compass**

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Navigate to `geopulse` → `users`
4. Edit your user document
5. Change `role` to `"admin"`

**Option 3: Through Code**

Temporarily modify `server/controllers/authController.js` registration function to hardcode admin role (remember to change it back!).

## Testing the Application

### Test Incident Reporting

1. Log in as a citizen
2. Click "Report Incident"
3. Fill in incident details
4. Select location on map
5. Upload photos (optional)
6. Submit

### Test Notifications

1. Create a second account
2. Set notification preferences in profile
3. Report an incident near that account's location
4. Check email for notification

### Test Admin Features

1. Log in as admin
2. Access Admin Panel
3. View statistics
4. Manage incidents
5. View all users

## Troubleshooting

### MongoDB Connection Error

- Check your connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure the database user has correct permissions

### ImageKit Upload Fails

- Verify your ImageKit credentials
- Check if your account is active
- Ensure URL endpoint is correct

### Email Not Sending

- For Gmail: Ensure 2FA is enabled and app password is used
- Check SMTP credentials
- Verify firewall isn't blocking port 587
- Try a different SMTP provider

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### CORS Issues

- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Check browser console for specific CORS errors

## Production Deployment

See [README.md](./README.md#deployment) for deployment instructions.

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review troubleshooting section above
3. Create a new issue with error logs
