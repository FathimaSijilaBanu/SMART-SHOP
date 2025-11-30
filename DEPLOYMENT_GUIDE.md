# 🚀 SmartShop Deployment Guide

## Deploy Django Backend to Render (Free)

This guide will help you deploy your Django backend to Render's free tier so your mobile app can access it from anywhere.

---

## 📋 Prerequisites

1. ✅ GitHub account
2. ✅ Render account (free) - Sign up at https://render.com
3. ✅ Your Django backend code

---

## 🔧 Step 1: Prepare Django for Production

### 1.1 Create Production Requirements

Create `backend/requirements-prod.txt`:

```txt
Django==4.2.7
djangorestframework==4.2.7
django-cors-headers==4.3.1
djangorestframework-simplejwt==5.3.0
django-filter==23.5
Pillow==10.1.0
python-decouple==3.8
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
dj-database-url==2.1.0
```

### 1.2 Update Django Settings for Production

We need to modify `backend/smartshop_backend/settings.py` to support production.

---

## 🌐 Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already done)

```bash
cd /home/codilar/Desktop/sajwa/SmartShop
git init
git add .
git commit -m "Initial commit - SmartShop with Django backend"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `SmartShop`
3. Make it **Private** (recommended)
4. Click "Create repository"

### 2.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/SmartShop.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 3: Deploy to Render

### 3.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `SmartShop` repository

### 3.2 Configure Service

**Basic Settings:**
- **Name:** `smartshop-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements-prod.txt && python manage.py collectstatic --no-input && python manage.py migrate
  ```
- **Start Command:**
  ```bash
  gunicorn smartshop_backend.wsgi:application
  ```

**Environment Variables:**
Click "Advanced" and add:

```
SECRET_KEY=your-secret-key-here-generate-a-new-one
DEBUG=False
ALLOWED_HOSTS=.render.com
DATABASE_URL=<will be auto-set if using Render PostgreSQL>
CORS_ALLOWED_ORIGINS=*
```

### 3.3 Create PostgreSQL Database (Optional but Recommended)

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name: `smartshop-db`
3. Click "Create Database"
4. Copy the "Internal Database URL"
5. Add it to your web service's environment variables as `DATABASE_URL`

### 3.4 Deploy!

Click "Create Web Service" - Render will:
1. Clone your repository
2. Install dependencies
3. Run migrations
4. Start your Django app

Wait 5-10 minutes for first deployment.

---

## 📱 Step 4: Update React Native App

Once deployed, Render will give you a URL like:
```
https://smartshop-backend.onrender.com
```

### 4.1 Update API Config

Edit `services/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://smartshop-backend.onrender.com/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

### 4.2 Rebuild App

```bash
cd android && ./gradlew assembleDebug && cd ..
```

### 4.3 Install New APK

Install the new APK on your phone - it will now connect to your deployed backend!

---

## ✅ Verification

Test your deployed backend:

1. **Visit in browser:**
   ```
   https://smartshop-backend.onrender.com/api/
   ```
   You should see the Django REST API page.

2. **Test registration:**
   ```bash
   curl -X POST https://smartshop-backend.onrender.com/api/accounts/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "phone": "1234567890",
       "user_type": "customer",
       "password": "testpass123",
       "password2": "testpass123"
     }'
   ```

---

## 🔒 Important Security Notes

1. **Generate a new SECRET_KEY:**
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

2. **Never commit secrets to Git:**
   - Use environment variables
   - Add `.env` to `.gitignore`

3. **Update CORS settings** in production:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-domain.com",
   ]
   ```

---

## 💰 Cost

**Render Free Tier:**
- ✅ Free web service (spins down after 15 min of inactivity)
- ✅ Free PostgreSQL database (90 days, then $7/month)
- ✅ Automatic HTTPS
- ✅ Automatic deployments from GitHub

**Note:** Free tier spins down after inactivity, so first request may take 30-60 seconds.

---

## 🔄 Continuous Deployment

Once set up, every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Render automatically deploys the changes! 🎉

---

## 🐛 Troubleshooting

### **Build fails:**
- Check build logs in Render dashboard
- Verify `requirements-prod.txt` has all dependencies
- Ensure `manage.py` is in `backend/` directory

### **App crashes:**
- Check application logs in Render
- Verify environment variables are set
- Check `ALLOWED_HOSTS` includes `.render.com`

### **Database errors:**
- Ensure `DATABASE_URL` is set
- Run migrations: `python manage.py migrate`
- Check PostgreSQL is running

### **CORS errors:**
- Update `CORS_ALLOWED_ORIGINS` in settings
- Ensure `django-cors-headers` is installed

---

## 🎯 Alternative: Railway (Also Free)

If you prefer Railway:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose SmartShop repository
5. Railway auto-detects Django and deploys!

Railway URL will be like: `https://smartshop-production.up.railway.app`

---

## 📊 What We'll Deploy

✅ **Django Backend** with:
- REST API endpoints
- JWT authentication
- PostgreSQL database
- Static files serving
- CORS configuration
- Production-ready settings

✅ **Features Working:**
- User registration/login
- Product management
- Order creation
- Credit records
- Reminders
- All CRUD operations

---

**Ready to deploy?** Let me know if you want to proceed with Render or try another platform!
