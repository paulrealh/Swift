# 🚀 Easy Deployment Guide - Railway

## Step 1: Delete Current Project
1. Go to Railway Dashboard
2. Click on "production" project
3. Click Settings (bottom)
4. Click "Delete Project"
5. Confirm deletion

---

## Step 2: Deploy Backend

### Create Backend Service:
1. Go to https://railway.app/dashboard
2. Click "+ New"
3. Click "Deploy from GitHub"
4. Select: **paulrealh/Swift**
5. Click "Deploy"

### Configure Backend:
When Railway asks for settings:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Set Environment Variables for Backend:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swift
JWT_SECRET=your_secure_secret_key_here
USDAT_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
USDAT_NGN_RATE=1500
PORT=5000
```

Then click "Deploy"

**Wait for it to finish (5-10 minutes)** ✅

Once done, you'll see:
- Backend URL like: `https://swift-backend-xxxxx.railway.app`

---

## Step 3: Deploy Frontend

### Create Frontend Service:
1. Go to https://railway.app/dashboard
2. Click "+ New"
3. Click "Deploy from GitHub"
4. Select: **paulrealh/Swift**
5. Click "Deploy"

### Configure Frontend:
When Railway asks for settings:
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Set Environment Variables for Frontend:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```
(Replace with the actual backend URL from Step 2)

Then click "Deploy"

**Wait for it to finish (5-10 minutes)** ✅

Once done, you'll see:
- Frontend URL like: `https://swift-frontend-xxxxx.railway.app`

---

## Step 4: Access Your App

### On Any Device:
- **Computer**: Open `https://swift-frontend-xxxxx.railway.app`
- **Phone**: Open `https://swift-frontend-xxxxx.railway.app`
- **Tablet**: Open `https://swift-frontend-xxxxx.railway.app`

### Login or Register:
- Click "Register" to create account
- Enter email, password, first name, last name
- Click "Register"
- You're in! 🎉

---

## ⚠️ Important: Set Up MongoDB Atlas First

Before deploying, you MUST set up MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (Free)
3. Create a free cluster
4. Create a database user (username + password)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`
6. Use this as `MONGODB_URI` in Railway

---

## 🎯 Your Live Links (After Deployment)

Save these:
- **Backend**: https://swift-backend-xxxxx.railway.app
- **Frontend**: https://swift-frontend-xxxxx.railway.app

---

## ✅ You're Done!

Your Swift Investment Platform is now LIVE! 🚀

Access from anywhere, on any device!
