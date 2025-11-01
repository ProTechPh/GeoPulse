# Smart Community Incident Reporting System

A comprehensive web and mobile platform for reporting local incidents with real-time geolocation and email notifications.

## Features

- **User Authentication**: Role-based access for citizens, responders, and administrators
- **Incident Submission**: Form with photo upload, category tagging, and auto-geolocation
- **Interactive Map Dashboard**: Real-time incident visualization using Leaflet
- **Email Notifications**: SMTP integration for proximity-based alerts
- **Admin Panel**: Incident triage, status updates, and analytics dashboard
- **PWA Support**: Offline mode with local caching and sync

## Tech Stack

- **Frontend**: React (PWA), Leaflet, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **APIs**: ImageKit.io (media), SMTP (notifications)
- **Hosting**: Vercel (frontend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance
- ImageKit.io account
- SMTP credentials (Gmail/SendGrid)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   - Copy `server/.env.example` to `server/.env` and fill in values
   - Copy `client/.env.example` to `client/.env` and fill in values

4. Start development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
GeoPulse/
├── client/          # React PWA frontend
├── server/          # Node.js Express backend
├── shared/          # Shared types and utilities
└── package.json     # Root package configuration
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL
4. Deploy

### Backend (Render)

**See detailed instructions**: [DEPLOY_STEPS.md](./DEPLOY_STEPS.md) or [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Quick Steps:**
1. Push code to GitHub
2. Create Web Service in Render dashboard
3. Set **Root Directory** to `server` ⚠️ **Important!**
4. Configure environment variables (see deployment guides)
5. Deploy

**Other hosting options:**
- Railway
- Heroku
- DigitalOcean App Platform

## Development

### Running Locally

```bash
# Install dependencies
npm run install:all

# Start both client and server
npm run dev

# Or start individually
npm run dev:client  # Frontend on :5173
npm run dev:server  # Backend on :5000
```

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents/:id` - Get incident details
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident (admin)

## License

MIT
