# Trade-X Deployment Guide

## 🚀 What You Have Now

✅ **Frontend**: React app running on http://localhost:3000  
✅ **Backend**: Node.js API running on http://localhost:5000  
✅ **Database**: PostgreSQL on Neon.tech  
✅ **Authentication**: Login/Register system  
✅ **API Integration**: Frontend connected to backend  

## 📋 Next Steps

### 1. Test Your App Locally

1. **Frontend**: http://localhost:3000
2. **Backend**: http://localhost:5000
3. **Try registering a new account**
4. **Test the portfolio and market data features**

### 2. Deploy Backend to Railway/Render

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `backend` folder
4. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string
   - `PORT`: 5000

**Option B: Render**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your deployed backend URL
   - `GEMINI_API_KEY`: Your actual Gemini API key

### 4. Update API URL

Once your backend is deployed, update your frontend:

```bash
# In .env.local, change:
VITE_API_URL=https://your-backend-url.railway.app/api
```

### 5. Share with Friends

Once deployed, you'll have URLs like:
- **Frontend**: `https://trade-x-xyz.vercel.app`
- **Backend**: `https://your-backend.railway.app`

Share the frontend URL with your friends!

## 🔧 Environment Variables Summary

### Frontend (.env.local)
```
GEMINI_API_KEY=your_actual_gemini_api_key
VITE_API_URL=https://your-backend-url.railway.app/api
```

### Backend (.env)
```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secure_random_string
PORT=5000
```

## 🎯 Features Your Friends Can Use

- ✅ **Register/Login** with email and password
- ✅ **View Market Data** (SPY, QQQ, BTC prices)
- ✅ **Track Portfolio** (add buy/sell transactions)
- ✅ **Run Simulations** (Monte Carlo analysis)
- ✅ **Browse Strategies** (pre-built investment strategies)
- ✅ **Market Analysis** (sector performance, top movers)

## 🚨 Important Notes

1. **Database**: Your Neon database is already set up and working
2. **API Keys**: Keep your Gemini API key secure
3. **Costs**: Neon, Railway, and Vercel all have generous free tiers
4. **Updates**: Push to GitHub to automatically redeploy

Your Trade-X app is ready to share with the world! 🎉